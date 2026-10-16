const ads = require('../../utils/ads'), store = require('../../utils/store'), gd = require('../../data/goods')
Page({
  data: {
    bannerOn: ads.bannerOn(), bannerId: ads.bannerId,
    banners: [{ t: '每日签到领云朵币', s: '连续签到，奖励越来越高', e: '🎁', a: 'sign' }, { t: '看视频，云朵币翻倍赚', s: '个人中心每天可领 5 次', e: '🎬', a: 'mine' }, { t: '数码新品上架', s: '满 300 减 60 大额券', e: '🎧', a: 'cat' }],
    cats: ['全部'], cat: '全部', kw: '', sort: 'def', goods: [], balance: 0, streak: 0, signed: false
  },
  onShow() {
    store.badge(0); const d = store.get()
    this.setData({ cats: gd.CATS, balance: d.balance, streak: d.streak, signed: store.isSigned() }); this.filter()
  },
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
    const list = gd.GOODS.filter(g => (cat === '全部' || g.cat === cat) && (!kw || g.name.indexOf(kw) >= 0))
      .map(g => Object.assign({}, g, { ci: Math.max(0, gd.CATS.indexOf(g.cat) - 1) }))
    if (sort === 'sales') list.sort((a, b) => b.sales - a.sales)
    else if (sort === 'pa') list.sort((a, b) => a.price - b.price)
    else if (sort === 'pd') list.sort((a, b) => b.price - a.price)
    this.setData({ goods: list })
  },
  onAdErr() { this.setData({ bannerOn: false }) },
  onBanner(e) {
    const a = e.currentTarget.dataset.a
    if (a === 'sign') this.onSign()
    else if (a === 'mine') wx.switchTab({ url: '/pages/mine/mine' })
    else this.setData({ cat: '数码' }, this.filter)
  },
  goDetail(e) { wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id }) }
})
