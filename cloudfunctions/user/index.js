// 云函数 user：用户数据存取 + 朋友帮取件。数据库集合：users（文档 _id = 用户 openid）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database(), _ = db.command, users = db.collection('users')
const DEF = () => ({ balance: 100, streak: 0, lastSign: '', orders: [], cart: [], addresses: [], selAddr: '', helped: [], coupons: [], adDay: '', adCnt: 0, rev: 0 })
const FIELDS = ['balance', 'streak', 'lastSign', 'orders', 'cart', 'addresses', 'selAddr', 'helped', 'coupons', 'adDay', 'adCnt']
const getDoc = async id => { try { return (await users.doc(id).get()).data } catch (e) { return null } }
async function ensure(id) {
  let doc = await getDoc(id), created = false
  if (!doc) { doc = Object.assign({ _id: id }, DEF()); await users.add({ data: doc }); created = true }
  return { doc, created }
}
exports.main = async ev => {
  const { OPENID } = cloud.getWXContext()
  if (ev.action === 'load') {
    const { doc, created } = await ensure(OPENID)
    return { ok: true, openid: OPENID, doc, created }
  }
  if (ev.action === 'save') { // 乐观锁：rev 不一致说明云端有更新（如朋友帮取件），返回最新数据让客户端采用
    const { doc } = await ensure(OPENID), s = ev.state || {}
    if (doc.rev !== ev.rev) return { ok: false, conflict: true, doc }
    const data = { rev: doc.rev + 1 }
    FIELDS.forEach(k => { if (s[k] !== undefined) data[k] = s[k] })
    if (typeof data.balance !== 'number' || data.balance < 0) data.balance = doc.balance
    await users.doc(OPENID).update({ data })
    return { ok: true, rev: data.rev }
  }
  if (ev.action === 'help') { // 帮朋友取件：校验取件码，标记包裹签收，帮取人得谢礼（每个包裹一次）
    const { oid, id, code, nick } = ev
    if (!oid || oid === OPENID) return { ok: false, msg: '不能帮自己取件哦' }
    const owner = await getDoc(oid), o = owner && owner.orders.find(x => x.id === id && x.code === code)
    if (!o) return { ok: false, msg: '取件码无效' }
    if (o.received) return { ok: false, msg: '这个包裹已经被取走啦' }
    if (Date.now() - o.createdAt < o.days * 864e5) return { ok: false, msg: '包裹还没到驿站' }
    o.received = true; o.helper = String(nick || '云朵好友').slice(0, 12)
    await users.doc(oid).update({ data: { orders: owner.orders, rev: _.inc(1) } })
    const { doc: me } = await ensure(OPENID)
    let reward = 0
    if (me.helped.indexOf(id) < 0) {
      reward = 10
      await users.doc(OPENID).update({ data: { balance: _.inc(10), helped: _.push(id), rev: _.inc(1) } })
    }
    return { ok: true, reward }
  }
  if (ev.action === 'subscribed') { // 用户同意订阅一次 → 增加一次可推送额度（订阅消息为一次性授权）
    await ensure(OPENID); await users.doc(OPENID).update({ data: { credits: _.inc(1) } })
    return { ok: true }
  }
  return { ok: false, msg: 'unknown action' }
}
