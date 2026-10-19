# 云边小憩 · 云函数与数据库集合清单

## 一、云函数（`cloudfunctions/`）
| 云函数 | action | 作用 | 读写集合 |
|---|---|---|---|
| `user` | `load` | 读取/创建当前用户数据，返回 openid | users |
| | `save` | 保存用户数据（rev 乐观锁，冲突时返回云端最新数据） | users |
| | `help` | 朋友帮取件：校验取件码→标记签收→帮取人 +10 云朵币 | users |
| | `subscribed` | 记录一次订阅消息授权额度（credits +1） | users |
| `goods` | `catalog` | 返回分类 + 商品列表（精简字段）+ 优惠券；goods 为空时自动用 `seed.json` 初始化 | categories / goods / coupons |
| | `detail` | 返回单个商品详情（规格、参数、卖点、评价等） | goods |
| `notify` | 定时触发（每10分钟） | 物流节点变化时推送订阅消息，扣减 credits | users |

## 二、数据库集合
### `users`（_id = 用户 openid，由 `user` 函数维护）
`balance` 云朵币 · `streak` 连续签到 · `lastSign` 上次签到日 · `orders[]` 订单 · `cart[]` 购物车 · `addresses[]` 收货地址 · `selAddr` 当前地址 ·
`helped[]` 已帮取的订单号 · `coupons[]` 已领优惠券 `{id,used}` · `adDay/adCnt` 看广告日期/次数 · `credits` 订阅额度 · `rev` 版本号

`orders[]` 元素：`id, name, emoji, price, off, days, createdAt, received, helper, code, station, addr, items[], notified`

### `goods`（商品，_id = `g{id}`）
列表字段：`id`(数字，唯一) `cat` `emoji` `name` `price` `days` `desc` `sales` `orig` `tag`
详情字段：`groups[]` 规格组 `{n, o:[{t,d}]}`（t=选项名，d=加价）· `pts[]` 卖点 · `params[]` 参数 `[[键,值]]` · `tags[]` 标签 · `reviews[]` 评价 `{n,t,s,spec}`
运营字段：`status`（`on` 上架 / `off` 下架）· `sort` 排序（越小越靠前）

### `categories`（分类，_id = `c{n}`）：`name` · `sort`
### `coupons`（优惠券，_id = `cp{id}`）：`id` · `t` 名称 · `off` 减免 · `min` 门槛 · `status`

## 三、权限与索引建议
- 所有集合都只由云函数访问，权限保持默认「仅创建者可读写」即可。
- 索引：`goods`：`id`（唯一）、`status + sort`；`categories`：`sort`；`users`：`credits`。

## 四、初始化数据
- **自动**：部署 `goods` 云函数后，首次打开小程序会自动写入 3 个集合的初始数据。
- **手动**：`database/` 下提供 JSON Lines 文件，可在云开发控制台 → 数据库 → 对应集合 → 导入（冲突模式选「覆盖」）。
- **日常运营**：直接在控制台编辑 `goods` 文档即可上下架、改价；小程序下次启动自动更新（本地缓存兜底）。
