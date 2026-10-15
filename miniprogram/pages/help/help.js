const store = require('../../utils/store'), cloud = require('../../utils/cloud')
Page({
  data: { p: {}, own: false, done: false, nick: '', got: 0 },
  onLoad(o) {
    const d = store.get()
    this.setData({ p: o, own: d.orders.some(x => x.id === o.id) || (!!o.oid && o.oid === d.oid), done: d.helped.indexOf(o.id) >= 0, nick: wx.getStorageSync('yd_nick') || '' })
  },
  onNick(e) { this.setData({ nick: e.detail.value }) },
  help() {
    const nick = this.data.nick.trim() || '云朵好友', p = this.data.p
    wx.setStorageSync('yd_nick', nick)
    if (cloud.enabled() && p.oid) { // 云端校验取件码并直接修改朋友的包裹状态
      cloud.call('help', { oid: p.oid, id: p.id, code: p.code, nick }).then(r => {
        if (!r.ok) return wx.showToast({ title: r.msg || '取件失败', icon: 'none' })
        this.setData({ done: true, nick, got: r.reward }); store.pull()
      }).catch(() => wx.showToast({ title: '网络开小差了，请重试', icon: 'none' }))
    } else this.setData({ done: true, nick, got: store.helpDone(p.id) })
  },
  onShareAppMessage() {
    const { p, done, nick } = this.data
    if (!done) return { title: '云朵 · 每天都有一个包裹在路上', path: '/pages/mall/mall' }
    return { title: `📦 ${nick}已帮你取到「${p.name}」啦！`, path: `/pages/orders/orders?done=${encodeURIComponent(p.id)}&by=${encodeURIComponent(nick)}` }
  }
})
