const share = require('../../utils/share'), store = require('../../utils/store'), gd = require('../../data/goods')
Page({
  data: { g: {}, d: { groups: [], params: [], pts: [], tags: [], reviews: [] }, slides: [{ t: '主图' }, { t: '细节图' }, { t: '场景图' }], cur: 0, sel: [], qty: 1, price: 0, specText: '', sheet: '', mode: '', cartN: 0, addr: '', coupons: [], revN: 0 },
  onLoad(o) {
    const g = gd.byId(o.id)
    if (!g) { wx.showToast({ title: '商品不存在或已下架', icon: 'none' }); return setTimeout(() => wx.navigateBack(), 1200) }
    wx.setNavigationBarTitle({ title: '商品详情' })
    this.apply(g, gd.detailLocal(g))
    gd.fetchDetail(g.id).then(r => { if (r) this.apply(Object.assign({}, g, r), r) }) // 云端详情覆盖
  },
  apply(g, d) {
    const sel = d.groups.map(() => 0)
    this.setData({ g, d, sel, qty: 1, revN: Math.round(d.sales * 0.3), ...this.calc(g, d, sel) })
  },
  calc(g, d, sel) { const p = gd.pick(d, g, sel); return { price: p.price, specText: p.spec } },
  onShow() {
    const a = store.addrCur(), have = store.get().coupons.map(c => c.id)
    this.setData({ cartN: store.cartCount(), addr: a ? a.region[1] + a.region[2] : '', coupons: gd.COUPONS.map(c => Object.assign({}, c, { got: have.indexOf(c.id) >= 0 })) })
  },
  onSw(e) { this.setData({ cur: e.detail.current }) },
  openSheet(e) { this.setData({ sheet: e.currentTarget.dataset.s, mode: e.currentTarget.dataset.m || '' }) },
  close() { this.setData({ sheet: '' }) },
  pick(e) {
    const { gi, oi } = e.currentTarget.dataset, sel = this.data.sel.slice(); sel[gi] = oi
    this.setData({ sel, ...this.calc(this.data.g, this.data.d, sel) })
  },
  qty(e) { this.setData({ qty: Math.max(1, Math.min(9, this.data.qty + Number(e.currentTarget.dataset.d))) }) },
  claim(e) { store.claim(Number(e.currentTarget.dataset.id)); wx.showToast({ title: '领取成功', icon: 'none' }); this.onShow() },
  ok() {
    const { g, qty, specText, price, mode } = this.data
    this.setData({ sheet: '' })
    if (mode === 'cart') { store.cartAdd(g.id, qty, specText, price); this.onShow(); wx.showToast({ title: '已加入购物车', icon: 'none' }) }
    else if (mode === 'buy') wx.navigateTo({ url: `/pages/confirm/confirm?mode=buy&id=${g.id}&n=${qty}&price=${price}&spec=${encodeURIComponent(specText)}` })
  },
  goCart() { wx.switchTab({ url: '/pages/cart/cart' }) },
  goAddr() { wx.navigateTo({ url: '/pages/address/address?select=1' }) },
  onShareAppMessage() { return { title: `${this.data.g.emoji} ${this.data.g.name}｜云边小憩`, path: '/pages/detail/detail?id=' + this.data.g.id, imageUrl: share.goods } }
})
