const cfg = require('../config')
let on = false
function init() {
  if (!on && wx.cloud && cfg.ENV && cfg.ENV !== 'your-env-id') { wx.cloud.init({ env: cfg.ENV, traceUser: true }); on = true }
  return on
}
const call = (action, data, name) => wx.cloud.callFunction({ name: name || 'user', data: Object.assign({ action }, data) }).then(r => r.result)
module.exports = { init, call, enabled: () => on }
