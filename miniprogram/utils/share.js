// 分享卡片图片（800×640，5:4）。想换图：保持文件名和尺寸，直接替换 images/share/ 下的同名文件即可。
const D = 'https://cloud1-7gm4povu4c997d57-1348715717.tcloudbaseapp.com/yunbian/'
module.exports = {
  app: D + 'share-app.png?sign=3d34063391d57ac0ecb84305ab218d54&t=1793087063',       // 默认分享图：首页、个人中心、朋友圈
  pickup: D + 'share-pickup.png?sign=495044dee947dc06675966ca857858ea&t=1793087033', // 分享取件码，请朋友帮忙取
  help: D + 'share-help.png?sign=ed1d2e0bc51ff6befcac2031b33bf816&t=1793087047',     // 朋友帮取件后回传的“已取到”回执
  goods: D + 'share-goods.png?sign=8a56f1467bc7e8c4297d7c43a2704792&t=1793087056'    // 分享商品
}
