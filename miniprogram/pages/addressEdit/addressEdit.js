const store = require('../../utils/store')
Page({
  data: { a: { name: '', phone: '', region: [], detail: '', isDefault: false }, editing: false },
  onLoad(o) {
    if (o.id) { const a = store.addrList().find(x => x.id === o.id); if (a) this.setData({ a, editing: true }) }
  },
  inp(e) { this.setData({ ['a.' + e.currentTarget.dataset.k]: e.detail.value }) },
  reg(e) { this.setData({ 'a.region': e.detail.value }) },
  def(e) { this.setData({ 'a.isDefault': e.detail.value }) },
  save() {
    const a = this.data.a
    if (!a.name.trim()) return wx.showToast({ title: '请填写收件人', icon: 'none' })
    if (!/^1\d{10}$/.test(a.phone)) return wx.showToast({ title: '手机号格式不对', icon: 'none' })
    if (!a.region.length) return wx.showToast({ title: '请选择所在地区', icon: 'none' })
    if (!a.detail.trim()) return wx.showToast({ title: '请填写详细地址', icon: 'none' })
    store.addrSave(a); wx.navigateBack()
  },
  del() { wx.showModal({ title: '删除该地址？', success: r => { if (r.confirm) { store.addrDel(this.data.a.id); wx.navigateBack() } } }) }
})
