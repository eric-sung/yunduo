const store = require('../../utils/store'), { byId } = require('../../data/goods')
Page({
  data: { list: [], total: 0 },
  onShow() { store.badge(); this.load() },
  load() {
    const list = store.get().cart.map(c => ({ id: c.id, n: c.n, g: byId(c.id) }))
    this.setData({ list, total: list.reduce((s, i) => s + i.g.price * i.n, 0) })
  },
  chg(e) {
    const { id, d } = e.currentTarget.dataset
    store.cartSet(this.data.list.map(i => ({ id: i.id, n: i.id === id ? i.n + Number(d) : i.n }))); this.load()
  },
  go() { wx.navigateTo({ url: '/pages/confirm/confirm?mode=cart' }) }
})
