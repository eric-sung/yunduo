const store = require('./utils/store'), cloud = require('./utils/cloud')
App({
  globalData: { f: '' },
  onShow(o) {
    cloud.init(); store.pull()
    const q = (o && o.query) || {}
    if (q.done && store.helpReceive(q.done, q.by)) {
      setTimeout(() => wx.showToast({ title: `${q.by || '朋友'}已帮你取件 💛`, icon: 'none', duration: 2500 }), 800)
    }
  }
})
