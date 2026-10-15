const notify = require('../../utils/notify'), store = require('../../utils/store'), { byId, COUPONS } = require('../../data/goods')
Page({
  data: { items: [], sub: 0, off: 0, total: 0, days: 0, balance: 0, addr: null, cpTxt: '' },
  onLoad(o) {
    this.mode = o.mode; this.cid = null
    const mk = (g, n, spec, price) => ({ id: g.id, key: g.id + '|' + (spec || ''), g, n, spec: spec || '', price: price || g.price })
    this.items = o.mode === 'buy' ? [mk(byId(o.id), Number(o.n) || 1, o.spec, Number(o.price))]
      : store.get().cart.map(c => mk(byId(c.id), c.n, c.spec, c.price))
    this.sub = this.items.reduce((s, i) => s + i.price * i.n, 0)
    this.setData({ items: this.items, sub: this.sub, days: Math.max.apply(null, this.items.map(i => i.g.days).concat(0)) })
  },
  onShow() {
    const a = store.addrCur()
    this.setData({ balance: store.get().balance, addr: a ? Object.assign({}, a, { text: a.region.join(' ') + ' ' + a.detail }) : null })
    this.calc()
  },
  calc() {
    this.cps = store.get().coupons.filter(c => !c.used).map(c => COUPONS.find(x => x.id === c.id)).filter(c => c.min <= this.sub).sort((a, b) => b.off - a.off)
    if (this.cid === null) this.cid = this.cps.length ? this.cps[0].id : 0
    const cp = this.cps.find(c => c.id === this.cid), off = cp ? cp.off : 0
    this.setData({ off, total: this.sub - off, cpTxt: cp ? `${cp.t} -${cp.off}` : (this.cps.length ? '不使用' : '暂无可用') })
  },
  pickCoupon() {
    if (!this.cps.length) return wx.showToast({ title: '暂无可用优惠券，去商品页领取吧', icon: 'none' })
    wx.showActionSheet({ itemList: this.cps.map(c => `${c.t}：满${c.min}减${c.off}`).concat('不使用优惠券'),
      success: r => { this.cid = this.cps[r.tapIndex] ? this.cps[r.tapIndex].id : 0; this.calc() } })
  },
  pickAddr() { wx.navigateTo({ url: '/pages/address/address?select=1' }) },
  submit() {
    if (!store.addrCur()) return wx.showToast({ title: '请先选择收货地址', icon: 'none' })
    notify.ask().then(() => this.doSubmit())   // 先弹出订阅授权，再提交订单
  },
  doSubmit() {
    const r = store.checkout(this.items, store.addrCur(), this.mode === 'cart', this.cid)
    if (r === 'noaddr') return wx.showToast({ title: '请先选择收货地址', icon: 'none' })
    if (r === 'nomoney') return wx.showToast({ title: '云朵币不够，明天继续签到吧', icon: 'none' })
    wx.showToast({ title: '下单成功，等快递吧~', icon: 'none' })
    setTimeout(() => wx.switchTab({ url: '/pages/orders/orders' }), 800)
  }
})
