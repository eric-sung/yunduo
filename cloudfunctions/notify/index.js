// 云函数 notify：由定时触发器（每10分钟）调用。物流进入新节点时，给有订阅额度的用户发订阅消息卡片。
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database(), _ = db.command
const TMPL_ID = 'your-template-id'                                   // ← 订阅消息模板 ID（与 miniprogram/config.js 保持一致）
const KEYS = { goods: 'thing1', status: 'phrase2', note: 'thing3', time: 'time4' } // ← 按所选模板的字段名修改
const TH = [0, 0.06, 0.25, 0.5, 0.8, 1]                              // 与小程序 utils/logistics.js 的节点进度一致
const MSG = { 1: ['已发货', '快递员已揽收，包裹出发啦'], 3: ['运输中', '正飞奔向你所在的城市'], 4: ['派送中', '快递员正在派送，马上到'], 5: ['待取件', null] }
const cut = (s, n) => String(s).slice(0, n)
const now = () => new Date(Date.now() + 8 * 36e5).toISOString().replace('T', ' ').slice(0, 16)

exports.main = async () => {
  if (TMPL_ID === 'your-template-id') return { ok: false, msg: '未配置模板 ID' }
  let last = '', sent = 0
  for (;;) {
    const q = { credits: _.gt(0) }; if (last) q._id = _.gt(last)
    const { data } = await db.collection('users').where(q).orderBy('_id', 'asc').limit(50).get()
    if (!data.length) break
    for (const u of data) {
      last = u._id
      let credits = u.credits, used = 0, changed = false
      for (const o of u.orders || []) {
        if (o.received || credits < 1) continue
        const r = (Date.now() - o.createdAt) / (o.days * 864e5)
        let idx = 0; TH.forEach((t, i) => { if (r >= t) idx = i })
        if (idx <= (o.notified || 0)) continue
        o.notified = idx; changed = true
        const m = MSG[idx]
        if (!m || (idx < 5 && credits < 2)) continue               // 最后一次额度留给“到驿站取件”通知
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: u._id, templateId: TMPL_ID, page: 'pages/orders/orders', miniprogramState: 'formal',
            data: { [KEYS.goods]: { value: cut(o.name, 20) }, [KEYS.status]: { value: m[0] },
              [KEYS.note]: { value: idx === 5 ? '取件码' + o.code : m[1] }, [KEYS.time]: { value: now() } }
          })
          credits--; used++; sent++
        } catch (e) { if (e.errCode === 43101) { used += credits; credits = 0 } }  // 用户额度已用完
      }
      if (changed) await db.collection('users').doc(u._id).update({ data: { orders: u.orders, credits: _.inc(-used), rev: _.inc(1) } })
    }
  }
  return { ok: true, sent }
}
