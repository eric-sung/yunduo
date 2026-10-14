const store = require('../../utils/store'), { CATS, GOODS } = require('../../data/goods')
Page({
  data: { cats: CATS, cat: '全部', kw: '', goods: GOODS, balance: 0, streak: 0, signed: false, cartN: 0 },
  onShow() { store.badge(0); const d = store.get(); this.setData({ balance: d.balance, streak: d.streak, signed: store.isSigned(), cartN: store.cartCount() }) },
  onSign() {
    const g = store.sign()
    if (!g) return wx.showToast({ title: '今天已经签过啦', icon: 'none' })
    wx.showToast({ title: `+${g} 云朵币`, icon: 'none' }); this.onShow()
  },
  onCat(e) { this.setData({ cat: e.currentTarget.dataset.c }, this.filter) },
  onSearch(e) { this.setData({ kw: e.detail.value.trim() }, this.filter) },
  filter() {
    const { cat, kw } = this.data
    this.setData({ goods: GOODS.filter(g => (cat === '全部' || g.cat === cat) && (!kw || g.name.indexOf(kw) >= 0)) })
  },
  goDetail(e) { wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id }) },
  addCart(e) { store.cartAdd(e.currentTarget.dataset.id); this.onShow(); wx.showToast({ title: '已加入购物车', icon: 'none' }) },
  goCart() { wx.switchTab({ url: '/pages/cart/cart' }) }
})
