// import Vue from 'vue';
// import Taro from '@tarojs/taro';
// import Cml from 'chameleon-runtime';
export default {
    projectId: '9c76fe4756c3404d',
    appId: wx.getStorageSync('appId')?'':'wxd4626ea0768f555b', //如果不填会自动获取
    version: '1.0.3',
    debug: true, //是否开启调试模式，可以看到采集的数据。默认 false
    forceLogin: false, //是否强制要求用户登陆微信获取 openid。默认 true
    followShare: true, //是否详细跟踪分享数据，开启后可使用分享分析功能。默认false
    usePlugin: false, //是否使用了第三方插件。默认false
    getLocation: { //是否自动获取用户的地理位置信息, 并设置获取方式
        autoGet: false, //默认不自动获取
        type: 'wgs84' //支持wgs84 | gcj02, 默认wgs84
    },
    keepAlive: 300000, //默认 session 在 5min 之内打开不重新创建, 场景值变化除外
    vue: false, //是否使用了mpvue/uni-app框架, 取值: false | Vue
    taro: false, //是否使用了taro框架, 取值: false | Taro
    cml: false //是否使用了chameleon框架, 取值: false | Cml
}