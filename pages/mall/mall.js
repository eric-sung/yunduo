const store = require('../../utils/store'), { CATS, GOODS, detail } = require('../../data/goods')
const ALL = GOODS.map(g => {
  const d = detail(g)
  return Object.assign({}, g, { sales: d.sales, orig: d.orig, ci: CATS.indexOf(g.cat) - 1,
    tag: g.id % 4 === 0 ? '热卖' : g.id % 5 === 0 ? '新品' : g.days <= 1 ? '次日达' : '' })
})
Page({
  data: { cats: CATS, cat: '全部', kw: '', sort: 'def', goods: ALL, balance: 0, streak: 0, signed: false },
  onShow() { store.badge(0); const d = store.get(); this.setData({ balance: d.balance, streak: d.streak, signed: store.isSigned() }) },
  onSign() {
    const g = store.sign()
    if (!g) return wx.showToast({ title: '今天已经签过啦', icon: 'none' })
    wx.showToast({ title: `+${g} 云朵币`, icon: 'none' }); this.onShow()
  },
  onCat(e) { this.setData({ cat: e.currentTarget.dataset.c }, this.filter) },
  onSearch(e) { this.setData({ kw: e.detail.value.trim() }, this.filter) },
  onSort(e) {
    const s = e.currentTarget.dataset.s
    this.setData({ sort: s === 'price' ? (this.data.sort === 'pa' ? 'pd' : 'pa') : s }, this.filter)
  },
  filter() {
    const { cat, kw, sort } = this.data
    const list = ALL.filter(g => (cat === '全部' || g.cat === cat) && (!kw || g.name.indexOf(kw) >= 0))
    if (sort === 'sales') list.sort((a, b) => b.sales - a.sales)
    else if (sort === 'pa') list.sort((a, b) => a.price - b.price)
    else if (sort === 'pd') list.sort((a, b) => b.price - a.price)
    this.setData({ goods: list })
  },
  goDetail(e) { wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id }) }
})
