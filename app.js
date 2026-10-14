App({
  globalData: { f: '' },
  onShow(o) {
    const q = (o && o.query) || {}
    if (q.done && require('./utils/store').helpReceive(q.done, q.by)) {
      setTimeout(() => wx.showToast({ title: `${q.by || '朋友'}已帮你取件 💛`, icon: 'none', duration: 2500 }), 800)
    }
  }
})
