const store = require('../../utils/store')
Page({
  data: { p: {}, own: false, done: false, nick: '', got: 0 },
  onLoad(o) {
    const d = store.get()
    this.setData({ p: o, own: d.orders.some(x => x.id === o.id), done: d.helped.indexOf(o.id) >= 0, nick: wx.getStorageSync('yd_nick') || '' })
  },
  onNick(e) { this.setData({ nick: e.detail.value }) },
  help() {
    const nick = this.data.nick.trim() || '云朵好友'
    wx.setStorageSync('yd_nick', nick)
    this.setData({ done: true, nick, got: store.helpDone(this.data.p.id) })
  },
  onShareAppMessage() {
    const { p, done, nick } = this.data
    if (!done) return { title: '云朵 · 每天都有一个包裹在路上', path: '/pages/mall/mall' }
    return { title: `📦 ${nick}已帮你取到「${p.name}」啦！`, path: `/pages/orders/orders?done=${encodeURIComponent(p.id)}&by=${encodeURIComponent(nick)}` }
  }
})
