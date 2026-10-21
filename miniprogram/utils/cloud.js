const cfg = require('../config')
const valid = v => !!v && v.indexOf('your-') !== 0
let inst = null, ready = null
// 初始化云开发：自己的环境用 wx.cloud.init；共享环境（跨账号）用 new wx.cloud.Cloud + await init()
function init() {
  if (inst) return true
  if (!wx.cloud || !valid(cfg.ENV)) return false
  if (valid(cfg.RESOURCE_APPID)) {
    inst = new wx.cloud.Cloud({ resourceAppid: cfg.RESOURCE_APPID, resourceEnv: cfg.ENV })
    ready = inst.init().catch(e => { console.error('共享环境初始化失败', e); throw e })
  } else {
    wx.cloud.init({ env: cfg.ENV, traceUser: true }); inst = wx.cloud; ready = Promise.resolve()
  }
  return true
}
const call = (action, data, name) => Promise.resolve(ready)
  .then(() => inst.callFunction({ name: name || 'yb_user', data: Object.assign({ action }, data) })).then(r => r.result)
module.exports = { init, call, enabled: () => !!inst }
