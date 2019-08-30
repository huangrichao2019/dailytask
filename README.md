
# 测试方法，每次更换gio-minp的内容后，在index.js最后一行添加`exports.Utils = Utils;`
在gio-marketing.js marketingHost相关配置代码改成`
const tag = 'GTouchConfig';
try{
  marketingHost = wx.getStorageSync('marketingHost');
  
}catch(e){
  console.error('未找到marketingHost');
}

!!!growingio.marketingHost && (growingio.marketingHost = marketingHost ? marketingHost:'https://messages.growingio.com')
//打印全局marketingHost
console.log(tag, growingio.marketingHost);`

# dailytask
# dailytask
个人任务管理系统,小程序端源代码,任务清单,dailytask

1、支持多个清单切换

![任务列表](https://github.com/techidea8/dailytask/raw/master/1.jpg)
2、支持消息发布
和自定义面板
![任务列表](https://raw.githubusercontent.com/techidea8/dailytask/master/2.jpg)
![任务列表](https://raw.githubusercontent.com/techidea8/dailytask/master/4.jpg)
3、支持在线咨询


![任务列表](https://raw.githubusercontent.com/techidea8/dailytask/master/3.jpg)
