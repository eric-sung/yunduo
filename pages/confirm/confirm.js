const store = require('../../utils/store'), { byId } = require('../../data/goods')
Page({
  data: { items: [], total: 0, days: 0, balance: 0, addr: null },
  onLoad(o) {
    this.mode = o.mode
    this.items = o.mode === 'buy' ? [{ id: Number(o.id), g: byId(o.id), n: 1 }]
      : store.get().cart.map(c => ({ id: c.id, g: byId(c.id), n: c.n }))
    this.setData({
      items: this.items, total: this.items.reduce((s, i) => s + i.g.price * i.n, 0),
      days: Math.max.apply(null, this.items.map(i => i.g.days).concat(0))
    })
  },
  onShow() {
    const a = store.addrCur()
    this.setData({ balance: store.get().balance, addr: a ? Object.assign({}, a, { text: a.region.join(' ') + ' ' + a.detail }) : null })
  },
  pickAddr() { wx.navigateTo({ url: '/pages/address/address?select=1' }) },
  submit() {
    const r = store.checkout(this.items, store.addrCur(), this.mode === 'cart')
    if (r === 'noaddr') return wx.showToast({ title: '请先选择收货地址', icon: 'none' })
    if (r === 'nomoney') return wx.showToast({ title: '云朵币不够，明天继续签到吧', icon: 'none' })
    wx.showToast({ title: '下单成功，等快递吧~', icon: 'none' })
    setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 800)
  }
})
