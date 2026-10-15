const cfg = require('../config'), cloud = require('./cloud')
const available = () => cloud.enabled() && !!cfg.TMPL_ID && cfg.TMPL_ID !== 'your-template-id'
// 必须在用户点击事件里调用；同意一次 = 获得一次推送额度
function ask() {
  return new Promise(resolve => {
    if (!available()) return resolve(false)
    wx.requestSubscribeMessage({
      tmplIds: [cfg.TMPL_ID],
      success: r => { const ok = r[cfg.TMPL_ID] === 'accept'; if (ok) cloud.call('subscribed').catch(() => {}); resolve(ok) },
      fail: () => resolve(false)
    })
  })
}
module.exports = { available, ask }
