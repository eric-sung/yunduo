const store = require('../../utils/store'), { byId } = require('../../data/goods')
Page({
  data: { g: {}, cartN: 0 },
  onLoad(o) { this.id = Number(o.id); this.setData({ g: byId(o.id) }); wx.setNavigationBarTitle({ title: byId(o.id).name }) },
  onShow() { this.setData({ cartN: store.cartCount() }) },
  addCart() { store.cartAdd(this.id); this.onShow(); wx.showToast({ title: '已加入购物车', icon: 'none' }) },
  buyNow() { wx.navigateTo({ url: `/pages/confirm/confirm?mode=buy&id=${this.id}` }) },
  goCart() { wx.switchTab({ url: '/pages/cart/cart' }) }
})
