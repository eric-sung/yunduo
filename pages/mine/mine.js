const store = require('../../utils/store'), lg = require('../../utils/logistics')
const LV = [[30, '彩虹云 🌈'], [7, '积雨云 ⛈'], [3, '小云朵 ☁️'], [0, '云朵新芽 🌱']]
Page({
  data: { d: {}, cnt: 0, stList: [], days: [], signed: false, nick: '', lv: '' },
  onShow() {
    store.badge()
    const d = store.get(), c = { '待发货': 0, '运输中': 0, '待取件': 0, '已签收': 0 }
    d.orders.forEach(o => c[lg.view(o).status]++)
    this.setData({
      d, cnt: d.orders.length, signed: store.isSigned(),
      nick: wx.getStorageSync('yd_nick') || '云朵居民',
      lv: LV.find(l => d.streak >= l[0])[1],
      stList: [['待发货', '📝'], ['运输中', '🚚'], ['待取件', '📦'], ['已签收', '💛']].map(a => ({ k: a[0], i: a[1], n: a[0] === '已签收' ? 0 : c[a[0]] })),
      days: [0, 1, 2, 3, 4, 5, 6].map(i => ({ n: i + 1, gain: Math.min(50 + i * 10, 120), on: d.streak > 0 && i < (d.streak - 1) % 7 + 1 }))
    })
  },
  onSign() {
    const g = store.sign()
    if (!g) return wx.showToast({ title: '今天已经签过啦', icon: 'none' })
    wx.showToast({ title: `+${g} 云朵币`, icon: 'none' }); this.onShow()
  },
  editNick() {
    wx.showModal({ title: '修改昵称', editable: true, placeholderText: this.data.nick, success: r => {
      if (r.confirm && r.content.trim()) { wx.setStorageSync('yd_nick', r.content.trim()); this.onShow() } } })
  },
  goOrders(e) { getApp().globalData.f = (e && e.currentTarget.dataset.k) || '全部'; wx.switchTab({ url: '/pages/orders/orders' }) },
  go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) },
  about() { wx.showModal({ title: '关于云朵', showCancel: false, content: '商品、物流、取件码全部是虚拟的，不产生任何真实交易或快递。每天签到、收个“快递”，给日子添一点盼头。' }) },
  onReset() { wx.showModal({ title: '清空数据？', content: '云朵币、地址和包裹都会重置', success: r => { if (r.confirm) { store.reset(); this.onShow() } } }) }
})
