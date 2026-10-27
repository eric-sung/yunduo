# 云边小憩 · 部署说明（数据结构见 DATABASE.md）

## 零、没有自己的云环境？使用「共享环境」（同主体的其他小程序）
前提：两个小程序必须是**同一主体**（同一个人 / 同一家公司），仅绑定同一公众号不行。
设：资源方 = 拥有云环境的小程序；使用方 = 本小程序。

**资源方一侧（用资源方账号登录开发者工具）**
1. 云开发控制台 →「设置 / 更多」→「拓展能力 → 环境共享」→ 开通。
2. 「添加共享」：填使用方（本小程序）的 **AppID**，勾选要共享的环境，管理员扫码确认。
3. 在该环境里确认有云函数 **cloudbase_auth**：没有就上传本项目 `cloudfunctions/cloudbase_auth`（先把里面的 ALLOW 改成本小程序 AppID）；
   已经有了就**不要覆盖**，只在原函数里放行本小程序 AppID。
4. 上传部署 `cloudfunctions/yb_user`、`yb_goods`、`yb_notify` 到该环境
   （如果使用方的开发者工具里能看到共享环境并能上传，也可以直接在本项目里上传，选择该环境）。

**使用方一侧（本项目）**
5. 打开 `miniprogram/config.js`：
   `ENV` 填**资源方的环境 ID**，`RESOURCE_APPID` 填**资源方小程序的 AppID**。
6. 代码已处理好初始化（`miniprogram/utils/cloud.js`）：
   ```js
   const c1 = new wx.cloud.Cloud({ resourceAppid: '资源方AppID', resourceEnv: '资源方环境ID' })
   await c1.init()            // 跨账号必须等待 init 完成
   c1.callFunction({ name: 'yb_user', data: { action: 'load' } })
   ```
   注意：共享环境下不能再用 `wx.cloud.init` / `wx.cloud.callFunction`，要用上面这个实例。
7. 在项目设置里把 `project.config.json` 的 appid 改成本小程序的 AppID。

**共享环境的注意点**
- 本项目的云函数与集合都带 `yb_` 前缀（`yb_user`、`yb_users` 等），不会碰到资源方其他小程序的数据。
- 共享环境下云函数读到的用户是 `FROM_OPENID`（使用方用户），代码已适配。
- **订阅消息**：用户 openid 属于使用方小程序，不能用资源方的云调用发送。请在 `yb_notify` 云函数的**环境变量**里设置
  `APPID`、`SECRET`（使用方小程序的 AppID / AppSecret），函数会改走 HTTP 接口发送；若你的小程序开启了 IP 白名单，需要把云函数出口 IP 加入白名单。
- 未配置 `ENV` 时，小程序自动使用内置商品 + 本地存储，仍可正常使用。

## 一、使用自己小程序的云环境
1. 开发者工具 →「云开发」→ 开通环境，记下环境 ID，填到 `config.js` 的 `ENV`（`RESOURCE_APPID` 保持默认即可）。
2. 上传部署 `cloudfunctions/yb_user`、`yb_goods`（和 `yb_notify`）。集合会由云函数自动创建，首次打开自动写入商品、分类、优惠券。

## 二、物流状态订阅消息（卡片通知）
1. 公众平台 → 功能 → **订阅消息** → 公共模板库选一个与类目匹配的模板，拿到 **模板 ID**。
2. 填到 `miniprogram/config.js` 的 `TMPL_ID`，以及 `cloudfunctions/yb_notify/index.js` 顶部的 `TMPL_ID`。
3. 把 `yb_notify/index.js` 里 `KEYS` 的 `thing1 / phrase2 / thing3 / time4` 改成所选模板的真实字段名（thing 最多 20 字，phrase 最多 5 字）。
4. 部署 `yb_notify` 并「上传触发器」（每 10 分钟检查一次）。共享环境请按上面说明设置 `APPID / SECRET` 环境变量。
订阅消息是一次性授权：用户每同意一次，只能收到一条推送；最后一次额度留给「已到驿站、取件码」通知。

## 三、广告（流量主）
1. 小程序后台 → 推广 → 流量主，开通后创建 **激励视频广告位** 和 **Banner 广告位**。
2. 填到 `config.js` 的 `AD_REWARD_ID`、`AD_BANNER_ID`；未填时个人中心用 3 秒「模拟广告」演示，首页显示运营推广位。
3. 每天最多看 5 次，每次 +20 云朵币（`utils/store.js` 顶部 `AD_MAX / AD_GAIN` 可改）。

## 四、分享图片
分享卡片图在 `miniprogram/images/share/`，尺寸 **800×640（5:4）**，目前是示例图，可直接用同名文件替换（路径统一在 `utils/share.js` 配置）：
| 文件 | 用在哪里 |
|---|---|
| `share-pickup.png` | 分享取件码，请朋友帮忙取 |
| `share-help.png` | 朋友帮取件后回传的“已取到”回执 |
| `share-goods.png` | 分享商品（详情页） |
| `share-app.png` | 首页 / 个人中心 / 朋友圈分享，以及其他兜底场景 |
建议单张不超过 200KB。想给不同商品配不同分享图，可以在 `pages/detail/detail.js` 的 `onShareAppMessage` 里按商品 id 返回不同的 `imageUrl`。
