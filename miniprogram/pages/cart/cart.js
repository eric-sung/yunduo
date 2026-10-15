const store = require('../../utils/store'), { byId } = require('../../data/goods')
Page({
  data: { list: [], total: 0 },
  onShow() { store.badge(1); this.load() },
  load() {
    const list = store.get().cart.map(c => ({ id: c.id, n: c.n, spec: c.spec || '', price: c.price || byId(c.id).price, key: c.key || c.id + '|', g: byId(c.id) }))
    this.setData({ list, total: list.reduce((s, i) => s + i.price * i.n, 0) })
  },
  chg(e) {
    const { k, d } = e.currentTarget.dataset
    store.cartSet(this.data.list.map((i, x) => ({ id: i.id, spec: i.spec, price: i.price, key: i.key, n: x === k ? i.n + Number(d) : i.n }))); this.load(); store.badge()
  },
  go() { wx.navigateTo({ url: '/pages/confirm/confirm?mode=cart' }) }
})
