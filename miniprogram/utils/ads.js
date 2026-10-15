const cfg = require('../config')
const ok = id => !!id && id.indexOf('your-') !== 0
module.exports = { rewardId: cfg.AD_REWARD_ID, bannerId: cfg.AD_BANNER_ID, rewardOn: () => ok(cfg.AD_REWARD_ID), bannerOn: () => ok(cfg.AD_BANNER_ID) }
