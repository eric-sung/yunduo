// cloudbase_auth：共享环境的“门卫”。使用方小程序初始化共享环境时会先调用它。
// ⚠ 如果资源方环境里已经有 cloudbase_auth（其他小程序在用），不要覆盖，只需把下面的 ALLOW 里的 AppID 加进已有函数即可。
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const ALLOW = ['wx34755664ba17e50e','wx76df0bc889a169d3'] // 允许访问本环境的小程序 AppID
exports.main = async () => {
  const { FROM_APPID } = cloud.getWXContext()
  if (FROM_APPID && ALLOW.indexOf(FROM_APPID) < 0) return { errCode: 403, errMsg: '未授权的小程序', auth: '{}' }
  return { errCode: 0, errMsg: '', auth: JSON.stringify({}) }
}
