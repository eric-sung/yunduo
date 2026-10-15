const store = require('../../utils/store')
Page({
  data: { list: [], select: false, sel: '' },
  onLoad(o) { this.setData({ select: o.select === '1' }) },
  onShow() { const a = store.addrCur(); this.setData({ list: store.addrList().map(x => Object.assign({}, x, { text: x.region.join(' ') + ' ' + x.detail })), sel: a ? a.id : '' }) },
  pick(e) { if (!this.data.select) return; store.addrSel(e.currentTarget.dataset.id); wx.navigateBack() },
  edit(e) { wx.navigateTo({ url: '/pages/addressEdit/addressEdit?id=' + (e.currentTarget.dataset.id || '') }) }
})
