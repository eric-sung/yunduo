const share = require('../../utils/share'), notify = require('../../utils/notify'), store = require('../../utils/store'), lg = require('../../utils/logistics')
const FS = ['全部', '待发货', '运输中', '待取件', '已签收']
Page({
  data: { list: [], tabs: [], f: '全部' },
  open: {},
  onShow() {
    clearInterval(this.timer); store.pull(); this.setData({ subOn: notify.available() })
    const g = getApp().globalData
    if (g.f) { this.setData({ f: g.f }); g.f = '' }
    store.badge(2); this.load(); this.timer = setInterval(() => this.load(), 30000)
  },
  onHide() { clearInterval(this.timer) },
  onUnload() { clearInterval(this.timer) },
  load() {
    const all = store.get().orders.map(o => Object.assign(lg.view(o), { open: !!this.open[o.id] })).reverse(), f = this.data.f
    this.setData({
      tabs: FS.map(k => ({ k, n: k === '全部' ? 0 : all.filter(o => o.status === k).length })),
      list: f === '全部' ? all : all.filter(o => o.status === f)
    })
  },
  setF(e) { this.setData({ f: e.currentTarget.dataset.k }, () => this.load()) },
  toggle(e) { const id = e.currentTarget.dataset.id; this.open[id] = !this.open[id]; this.load() },
  onPick(e) { store.receive(e.currentTarget.dataset.id); wx.showToast({ title: '取件成功 📦', icon: 'none' }); this.load(); store.badge() },
  onSub() { notify.ask().then(ok => wx.showToast({ title: ok ? '已订阅，物流更新会通知你 🔔' : '未开启订阅', icon: 'none' })) },
  goMall() { wx.switchTab({ url: '/pages/mall/mall' }) },
  onShareAppMessage(e) {
    const id = e.target && e.target.dataset.id, o = store.get().orders.find(x => x.id === id)
    if (!o) return { title: '云边小憩 · 每天都有一个包裹在路上', path: '/pages/mall/mall', imageUrl: share.app }
    const q = ['id', 'name', 'emoji', 'code', 'station'].map(k => k + '=' + encodeURIComponent(o[k])).join('&')
    return { title: `${o.emoji} 我有个包裹到驿站啦，能帮我取一下吗？`, path: '/pages/help/help?' + q + '&oid=' + encodeURIComponent(store.get().oid || ''), imageUrl: share.pickup }
  }
})
