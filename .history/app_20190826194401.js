var gio = require("utils/gio-minp.js").default;
// version 是你的小程序的版本号，发版时请调整
gio('init', '你的 GrowingIO 项目ID', '你的微信小程序的 AppID', { version: '1.0' });
//app.js
var util = require("./utils/util");

App({
    util: util,
    onLaunch: function() {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
    },
    defaultpanel: [
        { name: '默认', value: '0', checked: true },
        { name: '工作', value: '1', checked: false },
        { name: '生活', value: '2', checked: false }
    ],
    getUserInfo: function(cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function() {
                    wx.getUserInfo({
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },
    globalData: {
        userInfo: null
    }
})