"use strict";global.__growing__||console.error("未加载 gio SDK");const gio=global.__growing__.gio,growingio=global.__growing__.growingio,gioEmitter=global.__growing__.gioEmitter;let initAppSended=!1;function debounce(e,t){var s;return function(){var i=this,a=[].slice.call(arguments);clearTimeout(s),s=setTimeout(function(){e.apply(i,a)},t)}}!growingio.marketingHost&&(growingio.marketingHost="https://messages.growingio.com");class WxStorage{constructor(e){this.namespace=e}key(e){return"#"+this.namespace+"#"+e}get(e){return JSON.parse(wx.getStorageSync(this.key(e)))}set(e,t){wx.setStorageSync(this.key(e),JSON.stringify(t))}}class StatusStorage extends WxStorage{get(e){var t=wx.getStorageSync(this.key(e));return t?JSON.parse(t):(this.set(e,{showTimes:0}),this.get(e))}plus(e,t){var s=this.get(e);s.showTimes=s.showTimes+t,this.set(e,s)}}class Marketing{constructor(){console.log("Marketing 启动."),this.statusStorage=new StatusStorage("push-status"),this.cs1=gio("getUserId"),this.bu=null,this.bcs=null,this.timer=null,this.isCreatedInstance=!1,this.fetchedMessages=[],this.hasConsumeEvent=!1,this.setCs1=this.setCs1.bind(this),this.handleEvent=this.handleEvent.bind(this),this.initSeveralState(),this.startFetchPushMessageFromRemote=debounce(this.startFetchPushMessageFromRemote,50)}static getInstance(){return this.marketing||(this.marketing=new Marketing),this.marketing}clear(){this.fetchedMessages=[]}run(){this.isCreatedInstance||(this.isCreatedInstance=!0,this.startFetchPushMessageFromRemote(),gioEmitter.on("appShow",()=>{initAppSended=!1}),gioEmitter.on("setCs1",this.setCs1)),this.isRunning||(this.isRunning=!0,gioEmitter.addListener("appOpen",this.handleEvent),gioEmitter.addListener("upload",this.handleEvent))}stop(){gioEmitter.removeListener("upload",this.handleEvent),gioEmitter.removeListener("appOpen",this.handleEvent),this.initSeveralState()}initSeveralState(){this.listener=null,this.messageNeedToRender=[],this.unResolvedEvents=[],this.isRunning=!1}fetchPushMessageFromRemote(){let e=`${growingio.marketingHost}/v1/${growingio.projectId}/notifications?url_scheme=${growingio.appId}`;e+=this.bu?`&bu=${this.bu}`:`&u=${growingio.weixin.uid}`,this.cs1&&(e+=this.bcs?`&bcs=${this.bcs}`:`&cs=${this.cs1}`);const t=(new Date).valueOf();wx.request({url:e,success:e=>{const s=(new Date).valueOf();this.bcs=e.data.idMappings.bcs,this.bu=e.data.idMappings.bu,this.fetchedMessages=this.refreshPushMessageFrmRemote(e.data.popupWindows),this.hasConsumeEvent||(s-t>5e3&&(this.unResolvedEvents=[]),this.hasConsumeEvent=!0,this.handleEvent())}})}startFetchPushMessageFromRemote(){this.fetchedMessages=[],this.hasConsumeEvent=!1,this.fetchPushMessageFromRemote(),clearInterval(this.timer),this.timer=setInterval(()=>{this.fetchPushMessageFromRemote()},18e5)}refreshPushMessageFrmRemote(e){return e.sort((e,t)=>t.updateAt>e.updateAt?1:-1)}getValidMessages(e){return this.fetchedMessages.filter(t=>this.validActionType(t,e)).filter(e=>this.validTimeRange(e)).filter(e=>this.validateTimes(e))}validActionType(e,t){return t.n===e.rule.action}validTimeRange(e){const t=(new Date).valueOf();return t>=(e.rule.startAt||0)&&(e.rule.endAt||t+1)>t}validateTimes(e){var t=this.statusStorage.get(e.id).showTimes;return e.rule.limit>t}onTrackImp(e){gio("track","in_app_message_imp",{in_app_message_name:e.name}),this.statusStorage.plus(e.id,1)}onCloseWindow(e){gio("track","in_app_message_close",{in_app_message_name:e.name})}onClickTarget(e){gio("track","in_app_message_cmp_click",{in_app_message_name:e.name}),this.statusStorage.plus(e.id,1e3);const t=e.contentMetadata.components[0].config.target[`growing.${growingio.appId}`];t&&this.navigateTo(t)}navigateTo(e){wx.navigateTo({url:e,fail:()=>{wx.switchTab({url:e})}})}handleEvent(e){if(e&&"cstm"===e.t&&this.unResolvedEvents.push(e),this.hasConsumeEvent)for(;this.unResolvedEvents.length>0;)"cstm"===(e=this.unResolvedEvents.shift()).t&&this.fetchedMessages.length>0&&!e.n.startsWith("in_app_message_")&&(this.messageNeedToRender=this.messageNeedToRender.concat(this.getValidMessages(e)),this.dispatchMessage())}registerOnceMessageListener(e){this.listener=e,this.dispatchMessage()}dispatchMessage(){if(this.messageNeedToRender.length>0&&this.listener){var e=this.messageNeedToRender.shift();this.validateTimes(e)?(this.listener(e),this.listener=void 0):this.dispatchMessage()}}setCs1(e){this.cs1=e,this.startFetchPushMessageFromRemote()}}const marketing=Marketing.getInstance();Component({data:{message:void 0,visible:!1},pageLifetimes:{hide(){this.close()},show(){marketing.run(),this.registerListener(),initAppSended||(gioEmitter.emit("appOpen",{t:"cstm",n:"appOpen"}),initAppSended=!0)}},methods:{onClickTarget(){marketing.onClickTarget(this.data.message),this.hideModal(),this.registerListener()},handleClose(){marketing.onCloseWindow(this.data.message),this.hideModal(),this.registerListener()},handleTouchMove(){},registerListener(){marketing.registerOnceMessageListener(e=>{this.setData({message:e,visible:!0})})},hideModal(){this.setData({visible:!1})},close(){marketing.stop(),this.hideModal()}},observers:{"visible, message":function(e,t){e&&marketing.onTrackImp(t)}},attached(){marketing.run(),this.registerListener()},detached(){this.close()}});