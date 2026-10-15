const K = 'pandi_data'
const DEF = { balance: 100, streak: 0, lastSign: '', orders: [], cart: [], addresses: [], selAddr: '', helped: [], coupons: [], rev: 0, oid: '', adDay: '', adCnt: 0 }
const cloud = require('./cloud')
const { COUPONS } = require('../data/goods')
const fmt = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
const rnd = n => Math.floor(Math.random() * n)
function get() { try { return Object.assign({}, DEF, wx.getStorageSync(K) || {}) } catch (e) { return Object.assign({}, DEF) } }
function badge(sel) { // 刷新自定义 tabBar：购物车数量、待取件红点、选中项
  try {
    const d = get(), n = d.cart.reduce((s, x) => s + x.n, 0)
    const dot = d.orders.some(o => !o.received && Date.now() - o.createdAt >= o.days * 864e5)
    const ps = getCurrentPages(), p = ps[ps.length - 1]
    const tb = p && typeof p.getTabBar === 'function' && p.getTabBar()
    if (tb) tb.setData(sel === undefined ? { cartN: n, dot } : { cartN: n, dot, selected: sel })
  } catch (e) {}
}
// ---- 云端同步：本地缓存立即生效，变更防抖后经云函数写入云数据库 ----
let timer = null, busy = false, dirty = false, seq = 0
function refreshPage() { const ps = getCurrentPages(), p = ps[ps.length - 1]; p && typeof p.onShow === 'function' && p.onShow() }
function push() { if (!cloud.enabled()) return; dirty = true; seq++; clearTimeout(timer); timer = setTimeout(flush, 300) }
function flush() {
  if (busy) { timer = setTimeout(flush, 300); return }
  busy = true; const d = get(), my = seq
  cloud.call('save', { rev: d.rev, state: d }).then(r => {
    if (r.ok) { const n = get(); n.rev = r.rev; wx.setStorageSync(K, n); if (my === seq) dirty = false }
    else if (r.conflict) { wx.setStorageSync(K, Object.assign({}, DEF, r.doc)); dirty = false; badge(); refreshPage() }
  }).catch(() => {}).then(() => { busy = false })
}
function pull() { // 从云端拉取最新数据（帮取件、换设备登录等）
  if (!cloud.enabled() || dirty || busy) return Promise.resolve()
  return cloud.call('load').then(r => {
    if (!r.ok) return
    const local = get()
    if (r.created && (local.orders.length || local.addresses.length || local.streak)) { // 首次：把本地已有数据迁移上云
      local.oid = r.openid; local.rev = 0; wx.setStorageSync(K, local); push(); return
    }
    const next = Object.assign({}, DEF, r.doc, { oid: r.openid })
    if (JSON.stringify(next) !== JSON.stringify(local)) { wx.setStorageSync(K, next); badge(); refreshPage() }
  }).catch(() => {})
}
function set(d) { wx.setStorageSync(K, d); badge(); push() }
function isSigned() { return get().lastSign === fmt(new Date()) }
function sign() {
  const d = get(), t = fmt(new Date())
  if (d.lastSign === t) return 0
  d.streak = d.lastSign === fmt(new Date(Date.now() - 864e5)) ? d.streak + 1 : 1
  const gain = Math.min(50 + (d.streak - 1) * 10, 120)
  d.balance += gain; d.lastSign = t; set(d)
  return gain
}
// 购物车
function cartAdd(id, n, spec, price) {
  const d = get(), key = id + '|' + (spec || ''), c = d.cart.find(x => (x.key || x.id + '|') === key)
  c ? c.n += (n || 1) : d.cart.push({ id, n: n || 1, spec: spec || '', price, key }); set(d)
}
function claim(id) { const d = get(); if (d.coupons.some(c => c.id === id)) return false; d.coupons.push({ id, used: false }); set(d); return true }
function cartSet(list) { const d = get(); d.cart = list.filter(x => x.n > 0); set(d) }
function cartCount() { return get().cart.reduce((s, x) => s + x.n, 0) }
// 收货地址
function addrList() { return get().addresses }
function addrCur() { const d = get(); return d.addresses.find(a => a.id === d.selAddr) || d.addresses.find(a => a.isDefault) || d.addresses[0] }
function addrSave(a) {
  const d = get()
  if (!a.id) a.id = 'A' + Date.now()
  if (a.isDefault || !d.addresses.length) { d.addresses.forEach(x => x.isDefault = false); a.isDefault = true }
  const i = d.addresses.findIndex(x => x.id === a.id)
  i >= 0 ? d.addresses[i] = a : d.addresses.push(a)
  d.selAddr = a.id; set(d)
}
function addrDel(id) {
  const d = get(); d.addresses = d.addresses.filter(x => x.id !== id)
  if (d.addresses.length && !d.addresses.some(x => x.isDefault)) d.addresses[0].isDefault = true
  if (d.selAddr === id) d.selAddr = ''
  set(d)
}
function addrSel(id) { const d = get(); d.selAddr = id; set(d) }
// 结算：items=[{g,n}]，fromCart 时清空购物车中已购商品
function checkout(items, addr, fromCart, cid) {
  const d = get(), sub = items.reduce((s, i) => s + i.price * i.n, 0)
  if (!addr) return 'noaddr'
  let off = 0; const cp = d.coupons.find(c => c.id === cid && !c.used), def = cp && COUPONS.find(x => x.id === cid)
  if (def && sub >= def.min) { off = def.off; cp.used = true }
  const total = sub - off
  if (d.balance < total) return 'nomoney'
  d.balance -= total
  d.orders.push({
    id: 'PD' + Date.now(), createdAt: Date.now(), received: false, price: total, off,
    name: items[0].g.name + (items.length > 1 ? ` 等${items.length}件` : ''),
    emoji: items.map(i => i.g.emoji).slice(0, 3).join(''),
    days: Math.max.apply(null, items.map(i => i.g.days)),
    items: items.map(i => i.g.name + (i.spec ? '（' + i.spec + '）' : '') + '×' + i.n),
    addr: `${addr.name} ${addr.phone} ${addr.region.join('')}${addr.detail}`,
    code: `${1 + rnd(9)}-${1 + rnd(9)}-${1000 + rnd(9000)}`, station: `云朵驿站 ${1 + rnd(20)} 号柜`
  })
  if (fromCart) d.cart = d.cart.filter(c => !items.some(i => i.key === (c.key || c.id + '|')))
  set(d); return 'ok'
}
const AD_MAX = 5, AD_GAIN = 20 // 每天最多看 5 次，每次 +20 云朵币
function adInfo() { const d = get(); return { gain: AD_GAIN, left: Math.max(0, AD_MAX - (d.adDay === fmt(new Date()) ? d.adCnt : 0)) } }
function adReward() {
  const d = get(), t = fmt(new Date())
  if (d.adDay !== t) { d.adDay = t; d.adCnt = 0 }
  if (d.adCnt >= AD_MAX) return 0
  d.adCnt++; d.balance += AD_GAIN; set(d); return AD_GAIN
}
function receive(id) { const d = get(); d.orders.forEach(o => { if (o.id === id) o.received = true }); set(d) }
// 朋友帮忙取件：帮取方领取谢礼（每个包裹仅一次）；包裹主人通过回传链接确认
function helpDone(id) {
  const d = get(); if (d.helped.indexOf(id) >= 0) return 0
  d.helped.push(id); d.balance += 10; set(d); return 10
}
function helpReceive(id, by) {
  const d = get(), o = d.orders.find(x => x.id === id)
  if (!o || o.received) return false
  o.received = true; o.helper = by || '云朵好友'; set(d); return true
}
function reset() { const o = get(); set(Object.assign({}, DEF, { rev: o.rev, oid: o.oid })) }
module.exports = { adInfo, adReward, pull, claim, badge, get, isSigned, sign, cartAdd, cartSet, cartCount, addrList, addrCur, addrSave, addrDel, addrSel, checkout, receive, helpDone, helpReceive, reset }
