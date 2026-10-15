# 云朵 · 部署说明

## 一、云开发（数据存云端）
1. 用你自己的 **AppID**（不能用游客模式）导入本目录，修改 `project.config.json` 的 appid。
2. 开发者工具点「云开发」→ 开通环境，记下 **环境 ID**。
3. 云开发控制台 → 数据库 → 新建集合 **users**（权限保持默认）。
4. 把 `miniprogram/config.js` 的 `ENV` 改成环境 ID。
5. 右键 `cloudfunctions/user` →「上传并部署：云端安装依赖」。
未配置时自动退回本地存储，仍可正常使用。

## 二、物流状态订阅消息（卡片通知）
1. 微信公众平台 → 功能 → **订阅消息** → 公共模板库，选一个与类目匹配的模板（如「物流状态通知 / 订单状态通知」），拿到 **模板 ID**。
2. 填到 `miniprogram/config.js` 的 `TMPL_ID`，以及 `cloudfunctions/notify/index.js` 顶部的 `TMPL_ID`。
3. 把 `notify/index.js` 里 `KEYS` 的 `thing1 / phrase2 / thing3 / time4` 改成所选模板的真实字段名（thing 最多 20 字，phrase 最多 5 字）。
4. 右键 `cloudfunctions/notify` →「上传并部署：云端安装依赖」，再「上传触发器」（每 10 分钟检查一次）。
订阅消息是一次性授权：用户每同意一次，只能收到一条推送；最后一次额度留给「已到驿站、取件码」通知。

## 三、广告（流量主）
1. 小程序后台 → 推广 → 流量主，开通后分别创建 **激励视频广告位** 和 **Banner 广告位**。
2. 填到 `miniprogram/config.js` 的 `AD_REWARD_ID`、`AD_BANNER_ID`。
3. 未填写时：个人中心使用 3 秒「模拟广告」演示发奖；首页显示运营推广位（轮播图）。
4. 规则：每天最多看 5 次，每次 +20 云朵币（`utils/store.js` 顶部 `AD_MAX / AD_GAIN` 可改）。
> 流量主需满足 1000 UV 等开通条件；个人主体小程序也可申请，但部分广告类型受限。
