var task = require("../../service/task");
var app = getApp()
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

  onRequest: function () {
    var inputValue = this.data.inputValue
    console.log("我点击了" + inputValue);
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