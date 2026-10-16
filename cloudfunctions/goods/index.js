// 云函数 goods：商品目录与详情。集合：categories / goods / coupons
// 首次调用 catalog 时若 goods 集合为空，会自动用 seed.json 初始化（幂等）。
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const LIST_FIELDS = { id: true, cat: true, emoji: true, name: true, price: true, days: true, desc: true, sales: true, orig: true, tag: true, _id: false }

async function seed() {
  const s = require('./seed.json')
  for (const n of ['categories', 'goods', 'coupons']) { try { await db.createCollection(n) } catch (e) {} }
  await Promise.all([
    ...s.categories.map(d => db.collection('categories').doc(d._id).set({ data: strip(d) })),
    ...s.goods.map(d => db.collection('goods').doc(d._id).set({ data: strip(d) })),
    ...s.coupons.map(d => db.collection('coupons').doc(d._id).set({ data: strip(d) }))
  ])
}
const strip = d => { const o = Object.assign({}, d); delete o._id; return o }

exports.main = async ev => {
  if (ev.action === 'catalog') {
    let n = 0; try { n = (await db.collection('goods').count()).total } catch (e) {}
    if (!n) await seed()
    const [cats, goods, coupons] = await Promise.all([
      db.collection('categories').orderBy('sort', 'asc').limit(100).get(),
      db.collection('goods').where({ status: 'on' }).orderBy('sort', 'asc').field(LIST_FIELDS).limit(1000).get(),
      db.collection('coupons').where({ status: 'on' }).field({ id: true, off: true, min: true, t: true, _id: false }).limit(100).get()
    ])
    return { ok: true, cats: cats.data.map(c => c.name), goods: goods.data, coupons: coupons.data }
  }
  if (ev.action === 'detail') {
    const r = await db.collection('goods').where({ id: Number(ev.id), status: 'on' }).limit(1).get()
    if (!r.data.length) return { ok: false, msg: '商品不存在或已下架' }
    const g = r.data[0]; delete g._id
    return { ok: true, goods: g }
  }
  return { ok: false, msg: 'unknown action' }
}
