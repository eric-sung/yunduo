Component({
  data: {
    selected: 0, cartN: 0, dot: false,
    list: [
      { p: 'pages/mall/mall', t: '商城', off: '/images/tab/shop.svg', on: '/images/tab/shop-on.svg' },
      { p: 'pages/cart/cart', t: '购物车', off: '/images/tab/cart.svg', on: '/images/tab/cart-on.svg' },
      { p: 'pages/orders/orders', t: '包裹', off: '/images/tab/box.svg', on: '/images/tab/box-on.svg' },
      { p: 'pages/mine/mine', t: '我的', off: '/images/tab/me.svg', on: '/images/tab/me-on.svg' }
    ]
  },
  methods: { sw(e) { wx.switchTab({ url: '/' + e.currentTarget.dataset.p }) } }
})
