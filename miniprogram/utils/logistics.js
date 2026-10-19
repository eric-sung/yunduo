// 按“已过去时间 / 总时长”推进物流节点，纯虚拟
const STEPS = [
  [0, '订单已提交，等待商家打包'],
  [0.06, '商家已发货，快递员已揽收 🚚'],
  [0.25, '包裹已到达【云端转运中心】'],
  [0.5, '运输中，正飞奔向你所在的城市 ✈️'],
  [0.8, '已到达本地网点，正在分拣派送 🛵'],
  [1, '包裹已送达驿站，请凭取件码取件 🎉']
]
const p = n => (n < 10 ? '0' : '') + n
const tm = ts => { const d = new Date(ts); return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}` }
function view(o) {
  const total = o.days * 864e5, r = (Date.now() - o.createdAt) / total
  const reached = STEPS.filter(s => r >= s[0])
  const arrived = r >= 1
  const steps = reached.map(s => ({ txt: s[1], time: tm(o.createdAt + s[0] * total) })).reverse()
  if (o.received) steps.unshift({ txt: o.helper ? `已由「${o.helper}」帮你取件并签收 💛` : '已签收，感谢使用云边小憩 💛', time: '' })
  const status = o.received ? '已签收' : arrived ? '待取件' : reached.length > 2 ? '运输中' : '待发货'
  const left = total - (Date.now() - o.createdAt), h = Math.ceil(left / 36e5)
  const eta = h >= 24 ? `${Math.floor(h / 24)}天${h % 24 ? h % 24 + '小时' : ''}` : h >= 1 ? `${h}小时` : `${Math.max(1, Math.ceil(left / 6e4))}分钟`
  const cls = { '待发货': 'wait', '运输中': 'go', '待取件': 'pick', '已签收': 'done' }[status]
  return Object.assign({}, o, { cls, eta, prog: Math.min(100, Math.round(Math.max(r, 0) * 100)), sid: o.id.slice(-6), ctime: tm(o.createdAt), steps, arrived, status, latest: steps[0].txt, canPick: arrived && !o.received })
}
module.exports = { view }
