var { Utils } = require('../../utils/gio-minp/cjs/index.js');
var task = require("../../service/task")
var app = getApp()
var tag = 'GTouch'

// pages/gtouch/gtouch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    tasks:[],
    panels: app.defaultpanel,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    height:1024,
    userInfo: {},
    marketingHost:"https://messages.growing.com"
  },

  onInput: function (event) {
    
    if (!!event.detail.value && event.detail.value.length > 10) {
      return;
    }
    this.setData({
      "inputValue": event.detail.value
    })
    var inputValue = this.data.inputValue
    console.log(inputValue);
  },

  onRequestPreview: function () {
    // var inputValue = this.data.inputValue
    // console.log("我点击了" + inputValue);

    wx.request({
      url: `https://messages.growingio.com/v2/9c76fe4756c3404d/notifications/preview?message_id={this.data.inputValue}&url_scheme={wx.wx.getAccountInfoSync().miniProgram.appId}`,
      header: {
        "content-type": "application/json"
      },
      success: (res) => {
        console.log(res.data)
      },
      fail: () => {
        console.log(tag,'Error')
      }
    })
  },

  showVersion:function() {
    wx.showToast({
      title: wx.getAccountInfoSync().miniProgram.appId +' 版本：' +Utils.sdkVer,
      icon: 'none',
      duration: 1000
    })
  },
  checkoutQA:function(){
    wx.clearStorageSync()
    wx.setStorageSync('marketingHost','http://k8s-qa-messages.growingio.com' )
    wx.showToast({
      title: '切换环境成功',
      icon: 'none',
      duration: 2000
    })
  },
  checkoutOnline:function(){
    wx.clearStorageSync()
    wx.setStorageSync('marketingHost', 'https://messages.growingio.com')
    wx.showToast({
      title: '切换环境成功',
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})