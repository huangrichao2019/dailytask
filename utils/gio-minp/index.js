"use strict";
if (Object.defineProperty(exports, "__esModule", {
    value: !0
  }), !Object.hasOwnProperty("getOwnPropertyDescriptors")) {
  let t;
  t = "object" == typeof Reflect && "function" == typeof Reflect.ownKeys ? Reflect.ownKeys : "function" == typeof Object.getOwnPropertySymbols ? function(t) {
    return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))
  } : Object.getOwnPropertyNames, Object.defineProperty(Object, "getOwnPropertyDescriptors", {
    configurable: !0,
    writable: !0,
    value: function(e) {
      return t(e).reduce((t, n) => Object.defineProperty(t, n, {
        configurable: !0,
        enumerable: !0,
        writable: !0,
        value: Object.getOwnPropertyDescriptor(e, n)
      }), {})
    }
  })
}
class Uploader {
  constructor(t) {
    this.growingio = t, this.messageQueue = [], this.uploadingQueue = [], this.uploadTimer = null, this.projectId = this.growingio.projectId, this.appId = this.growingio.appId, this.host = this.growingio.host, this.url = `${this.host}/projects/${this.projectId}/apps/${this.appId}/collect`
  }
  upload(t) {
    this.messageQueue.push(t);
    const e = this.messageQueue.length;
    e > 100 && (this.messageQueue = this.messageQueue.slice(e - 100)), this.uploadTimer || (this.uploadTimer = setTimeout(() => {
      this._flush(), this.uploadTimer = null
    }, 1e3))
  }
  forceFlush() {
    this.uploadTimer && (clearTimeout(this.uploadTimer), this.uploadTimer = null), this._flush()
  }
  _flush() {
    this.uploadingQueue = this.messageQueue.slice(), this.messageQueue = [], this.uploadingQueue.length > 0 && wx.request({
      url: `${this.url}?stm=${Date.now()}`,
      header: {
        "content-type": "application/json"
      },
      method: "POST",
      data: this.uploadingQueue,
      success: () => {
        this.messageQueue.length > 0 && this._flush()
      },
      fail: () => {
        this.messageQueue = this.uploadingQueue.concat(this.messageQueue)
      }
    })
  }
}
var Utils = {
  sdkVer: "2.0.18",
  devVer: 1,
  guid: function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(t) {
      var e = 16 * Math.random() | 0;
      return ("x" == t ? e : 3 & e | 8).toString(16)
    })
  },
  getAppId: function() {
    let t = void 0;
    return wx.getSystemInfo({
      success(e) {
        0 > Utils.compareVersion(e.SDKVersion, "2.2.2") || (t = wx.getAccountInfoSync().miniProgram.appId)
      }
    }), t
  },
  getScreenHeight: function(t) {
    return Math.round(t.screenHeight * t.pixelRatio)
  },
  getScreenWidth: function(t) {
    return Math.round(t.screenWidth * t.pixelRatio)
  },
  getOS: function(t) {
    if (t) {
      var e = t.toLowerCase();
      return -1 != e.indexOf("android") ? "Weixin-Android" : -1 != e.indexOf("ios") ? "Weixin-iOS" : t
    }
  },
  getOSV: t => `Weixin ${t}`,
  isEmpty: t => {
    for (var e in t)
      if (t.hasOwnProperty(e)) return !1;
    return !0
  },
  compareVersion(t, e) {
    t = t.split("."), e = e.split(".");
    const n = Math.max(t.length, e.length);
    for (; n > t.length;) t.push("0");
    for (; n > e.length;) e.push("0");
    for (let i = 0; n > i; i++) {
      const n = parseInt(t[i]),
        s = parseInt(e[i]);
      if (n > s) return 1;
      if (s > n) return -1
    }
    return 0
  }
};
class Page$1 {
  constructor() {
    this.queries = {}, this.pvar = {}
  }
  touch(t) {
    this.path = t.route, this.time = Date.now(), this.query = this.queries[t.route] ? this.queries[t.route] : void 0
  }
  addQuery(t, e) {
    this.queries[t.route] = e ? this._getQuery(e) : null
  }
  _getQuery(t) {
    return Object.keys(t).filter(t => "wxShoppingListScene" !== t).map(e => `${e}=${t[e]}`).join("&")
  }
  touchRelatedPvarData(t) {
    const e = `${t.p}?${t.q}`;
    this.pvar[e] ? this.pvar[e].push(t) : this.pvar[e] = [t]
  }
}
const eventTypeMap = {
    tap: ["tap", "click"],
    longtap: ["longtap"],
    input: ["input"],
    blur: ["change", "blur"],
    submit: ["submit"],
    focus: ["focus"]
  },
  fnExpRE = /^function[^\(]*\([^\)]+\).*[^\.]+\.([^\(]+)\(.*/;

function getComKey(t) {
  return t && t.$attrs ? t.$attrs.mpcomid : "0"
}

function isVmKeyMatchedCompkey(t, e, n) {
  return !(!t || !e) && (e === t || 0 === e.indexOf(t + n))
}

function getVM(t, e, n) {
  void 0 === e && (e = []);
  var i = e.slice(1);
  if (!i.length) return t;
  var s = i.join(n),
    r = "";
  return i.reduce(function(t, e) {
    for (var i = t.$children.length, o = 0; i > o; o++) {
      var a = t.$children[o],
        g = getComKey(a);
      if (r && (g = r + n + g), isVmKeyMatchedCompkey(g, s, n)) return r = g, t = a
    }
    return t
  }, t)
}

function getHandle(t, e, n) {
  void 0 === n && (n = []);
  var i = [];
  if (!t || !t.tag) return i;
  var s = t || {},
    r = s.data;
  void 0 === r && (r = {});
  var o = s.children;
  void 0 === o && (o = []);
  var a = s.componentInstance;
  a ? Object.keys(a.$slots).forEach(function(t) {
    var s = a.$slots[t];
    (Array.isArray(s) ? s : [s]).forEach(function(t) {
      i = i.concat(getHandle(t, e, n))
    })
  }) : o.forEach(function(t) {
    i = i.concat(getHandle(t, e, n))
  });
  var g = r.attrs,
    u = r.on;
  return g && u && g.eventid === e && n.forEach(function(t) {
    var e = u[t];
    "function" == typeof e ? i.push(e) : Array.isArray(e) && (i = i.concat(e))
  }), i
}
const ONCE = "~",
  CUSTOM = "^";

function isMatchEventType(t, e) {
  return t === e || "regionchange" === e && ("begin" === t || "end" === t)
}
class VueProxy {
  constructor(t) {
    this.vueVM = t
  }
  getHandle(t) {
    var e = t.type,
      n = t.target;
    void 0 === n && (n = {});
    var i = (t.currentTarget || n).dataset;
    void 0 === i && (i = {});
    var s = i.comkey;
    void 0 === s && (s = "");
    var r = i.eventid;
    const o = -1 !== s.indexOf("_") ? "_" : ",";
    var a = getVM(this.vueVM, s.split(o), o);
    if (a) {
      var g = getHandle(a._vnode, r, eventTypeMap[e] || [e]);
      if (g.length) {
        var u = g[0];
        if (u.isProxied) return u.proxiedName;
        try {
          var h = ("" + u).replace("\n", "");
          if (h.match(fnExpRE)) {
            var l = fnExpRE.exec(h);
            if (l && l.length > 1) return l[1]
          }
        } catch (t) {}
        return u.name
      }
    }
  }
  handleEvent(t) {
    const e = t.type;
    let n;
    const i = (t.currentTarget || t.target).dataset;
    return (i.eventOpts || i["event-opts"]).forEach(t => {
      let i = t[0];
      const s = t[1];
      i = (i = i.charAt(0) === CUSTOM ? i.slice(1) : i).charAt(0) === ONCE ? i.slice(1) : i, s && isMatchEventType(e, i) && s.forEach(t => {
        n = t[0]
      })
    }), n
  }
}

function EventEmitter() {}
var proto = EventEmitter.prototype,
  originalGlobalValue = exports.EventEmitter;

function indexOfListener(t, e) {
  for (var n = t.length; n--;)
    if (t[n].listener === e) return n;
  return -1
}

function alias(t) {
  return function() {
    return this[t].apply(this, arguments)
  }
}

function isValidListener(t) {
  return "function" == typeof t || t instanceof RegExp || !(!t || "object" != typeof t) && isValidListener(t.listener)
}
proto.getListeners = function(t) {
  var e, n, i = this._getEvents();
  if (t instanceof RegExp)
    for (n in e = {}, i) i.hasOwnProperty(n) && t.test(n) && (e[n] = i[n]);
  else e = i[t] || (i[t] = []);
  return e
}, proto.flattenListeners = function(t) {
  var e, n = [];
  for (e = 0; t.length > e; e += 1) n.push(t[e].listener);
  return n
}, proto.getListenersAsObject = function(t) {
  var e, n = this.getListeners(t);
  return n instanceof Array && ((e = {})[t] = n), e || n
}, proto.addListener = function(t, e) {
  if (!isValidListener(e)) throw new TypeError("listener must be a function");
  var n, i = this.getListenersAsObject(t),
    s = "object" == typeof e;
  for (n in i) i.hasOwnProperty(n) && -1 === indexOfListener(i[n], e) && i[n].push(s ? e : {
    listener: e,
    once: !1
  });
  return this
}, proto.on = alias("addListener"), proto.addOnceListener = function(t, e) {
  return this.addListener(t, {
    listener: e,
    once: !0
  })
}, proto.once = alias("addOnceListener"), proto.defineEvent = function(t) {
  return this.getListeners(t), this
}, proto.defineEvents = function(t) {
  for (var e = 0; t.length > e; e += 1) this.defineEvent(t[e]);
  return this
}, proto.removeListener = function(t, e) {
  var n, i, s = this.getListenersAsObject(t);
  for (i in s) s.hasOwnProperty(i) && -1 !== (n = indexOfListener(s[i], e)) && s[i].splice(n, 1);
  return this
}, proto.off = alias("removeListener"), proto.addListeners = function(t, e) {
  return this.manipulateListeners(!1, t, e)
}, proto.removeListeners = function(t, e) {
  return this.manipulateListeners(!0, t, e)
}, proto.manipulateListeners = function(t, e, n) {
  var i, s, r = t ? this.removeListener : this.addListener,
    o = t ? this.removeListeners : this.addListeners;
  if ("object" != typeof e || e instanceof RegExp)
    for (i = n.length; i--;) r.call(this, e, n[i]);
  else
    for (i in e) e.hasOwnProperty(i) && (s = e[i]) && ("function" == typeof s ? r.call(this, i, s) : o.call(this, i, s));
  return this
}, proto.removeEvent = function(t) {
  var e, n = typeof t,
    i = this._getEvents();
  if ("string" === n) delete i[t];
  else if (t instanceof RegExp)
    for (e in i) i.hasOwnProperty(e) && t.test(e) && delete i[e];
  else delete this._events;
  return this
}, proto.removeAllListeners = alias("removeEvent"), proto.emitEvent = function(t, e) {
  var n, i, s, r, o = this.getListenersAsObject(t);
  for (r in o)
    if (o.hasOwnProperty(r))
      for (n = o[r].slice(0), s = 0; n.length > s; s++) !0 === (i = n[s]).once && this.removeListener(t, i.listener), i.listener.apply(this, e || []) === this._getOnceReturnValue() && this.removeListener(t, i.listener);
  return this
}, proto.trigger = alias("emitEvent"), proto.emit = function(t) {
  var e = Array.prototype.slice.call(arguments, 1);
  return this.emitEvent(t, e)
}, proto.setOnceReturnValue = function(t) {
  return this._onceReturnValue = t, this
}, proto._getOnceReturnValue = function() {
  return !this.hasOwnProperty("_onceReturnValue") || this._onceReturnValue
}, proto._getEvents = function() {
  return this._events || (this._events = {})
}, EventEmitter.noConflict = function() {
  return exports.EventEmitter = originalGlobalValue, EventEmitter
};
const gioEmitter = new EventEmitter;
class Observer {
  constructor(t) {
    this.growingio = t, this.weixin = t.weixin, this.currentPage = new Page$1, this.scene = null, this._sessionId = null, this.cs1 = null, this.lastPageEvent = void 0, this.lastVstArgs = void 0, this.lastCloseTime = null, this.lastScene = void 0, this.keepAlive = t.keepAlive, this.isPauseSession = !1, this._observer = null, this.CLICK_TYPE = {
      tap: "clck",
      longpress: "lngprss",
      longtap: "lngprss"
    }
  }
  get sessionId() {
    return null === this._sessionId && (this._sessionId = Utils.guid()), this._sessionId
  }
  resetSessionId() {
    this._sessionId = null
  }
  pauseSession() {
    this.isPauseSession = !0
  }
  getVisitorId() {
    return this.weixin.uid
  }
  getUserId() {
    return this.cs1
  }
  getGioInfo() {
    return `giou=${this.getVisitorId()}&giocs1=${this.getUserId()}&gios=${this.sessionId}`
  }
  setUserId(t) {
    var e = t + "";
    e && 100 > e.length && (this.cs1 = e, gioEmitter.emitEvent("setCs1", [e]), this.lastPageEvent && this._sendEvent(this.lastPageEvent))
  }
  clearUserId() {
    this.cs1 = null
  }
  collectImp(t, e = null) {
    this.growingio.vue && (t = t.$mp.page), this.growingio.taro && (t = t.$scope);
    var n = {};
    this._observer && this._observer.disconnect(), this._observer = t.isComponent ? t.createIntersectionObserver({
      observeAll: !0
    }) : wx.createIntersectionObserver(t, {
      observeAll: !0
    }), this._relative = e ? this._observer.relativeTo(e) : this._observer.relativeToViewport(), this._relative.observe(".growing_collect_imp", t => {
      t.id && !n[t.id] && (this.track(t.dataset.gioTrack && t.dataset.gioTrack.name, t.dataset.gioTrack && t.dataset.gioTrack.properties), n[t.id] = !0)
    })
  }
  appListener(t, e, n) {
    this.isPauseSession || (this.growingio.debug && console.log("App.", e, Date.now()), "onShow" == e ? (gioEmitter.emitEvent("appShow"), this._parseScene(n), !this.lastCloseTime || Date.now() - this.lastCloseTime > this.keepAlive || this.lastScene && this.scene !== this.lastScene ? (this.resetSessionId(), this.sendVisitEvent(n, this.growingio.getLocationType), this.lastVstArgs = n, this.lastPageEvent = void 0) : this.useLastPageTime = !0) : "onHide" == e ? (this.lastScene = this.scene, this.growingio.forceFlush(), this.weixin.syncStorage(), this.isPauseSession || (this.lastCloseTime = Date.now(), this.sendVisitCloseEvent())) : "onError" == e && this.sendErrorEvent(n))
  }
  pageListener(t, e, n) {
    if (this.growingio.debug && console.log("Page.", t.route, "#", e, Date.now()), "onShow" === e) this.isPauseSession ? this.isPauseSession = !1 : (this.currentPage.touch(t), this.sendPage(t));
    else if ("onLoad" === e) {
      Utils.isEmpty(i = n[0]) || this.currentPage.addQuery(t, i)
    } else if ("onHide" === e) this._observer && this._observer.disconnect();
    else if ("onUnload" === e) this.currentPage.pvar[`${this.currentPage.path}?${this.currentPage.query}`] = void 0;
    else if ("onShareAppMessage" === e) {
      var i = null,
        s = null;
      2 > n.length ? 1 === n.length && (n[0].from ? i = n[0] : n[0].title && (s = n[0])) : (i = n[0], s = n[1]), this.pauseSession(), this.sendPageShare(t, i, s)
    } else if ("onTabItemTap" === e) {
      this.sendTabClick(n[0])
    }
  }
  actionListener(t, e) {
    if ("_cmlEventProxy" !== e) {
      if ("handleProxy" === e && this.growingio.vueRootVMs && this.growingio.vueRootVMs[this.currentPage.path]) {
        let n = new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]).getHandle(t);
        n && (e = n)
      }
      if ("__e" === e && this.growingio.vueRootVMs && this.growingio.vueRootVMs[this.currentPage.path]) {
        let n = new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]).handleEvent(t);
        n && (e = n)
      }
      this.growingio.taroRootVMs && this.growingio.taroRootVMs[e] && (e = this.growingio.taroRootVMs[e]), this.growingio.debug && console.log("Click on ", e, Date.now()), "tap" === t.type || "longpress" === t.type ? this.sendClick(t, e) : -1 !== ["change", "confirm", "blur"].indexOf(t.type) ? this.sendChange(t, e) : "getuserinfo" === t.type ? (this.sendClick(t, e), t.detail && t.detail.userInfo && this.setVisitor(t.detail.userInfo)) : "getphonenumber" === t.type ? this.sendClick(t, e) : "contact" === t.type ? this.sendClick(t, e) : "submit" === t.type && this.sendSubmit(t, e)
    }
  }
  getLocation(t = "wgs84") {
    this.growingio.getLocation = !0, this.sendVisitEvent(this.lastVstArgs, t)
  }
  sendVideoCstm(t, e) {
    this.track(`video-${t.type}`, t.var)
  }
  track(t, e) {
    if (null !== t && void 0 !== t && 0 !== t.length) {
      var n = {
        t: "cstm",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query,
        n: t
      };
      null !== e && "object" == typeof e && (n.var = e), this._sendEvent(n)
    }
  }
  identify(t, e) {
    void 0 !== t && 0 !== t.length && (this.growingio.login(t), this._sendEvent({
      t: "vstr",
      var: {
        openid: t,
        unionid: e
      }
    }))
  }
  setVisitor(t) {
    this._sendEvent({
      t: "vstr",
      var: t
    })
  }
  setUser(t) {
    this._sendEvent({
      t: "ppl",
      var: t
    })
  }
  setPage(t) {
    var e = {
      t: "pvar",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query,
      var: t
    };
    this.currentPage.touchRelatedPvarData(e), this._sendEvent(e)
  }
  setEvar(t) {
    this._sendEvent({
      t: "evar",
      var: t
    })
  }
  sendVisitEvent(t, e = "wgs84") {
    e = -1 !== ["wgs84", "gcj02"].indexOf(e) ? e : "wgs84";
    var n = this.weixin.systemInfo || {},
      i = {
        t: "vst",
        tm: Date.now(),
        av: Utils.sdkVer,
        db: n.brand,
        dm: n.model && n.model.replace(/<.*>/, ""),
        sh: Utils.getScreenHeight(n),
        sw: Utils.getScreenWidth(n),
        os: Utils.getOS(n.platform),
        osv: Utils.getOSV(n.version),
        l: n.language
      };
    if (this.growingio.appVer && (i.cv = this.growingio.appVer + ""), t.length > 0) {
      var s = t[0];
      i.p = s.path, Utils.isEmpty(s.query) || (i.q = this.currentPage._getQuery(s.query)), i.ch = `scn:${this.scene}`, s.referrerInfo && s.referrerInfo.appId && (i.rf = s.referrerInfo.appId)
    }
    this.weixin.getNetworkType().then(t => {
      t && (i.nt = t.networkType, this._sendEvent(i), this.growingio.getLocation && this.weixin.requestLocation(e).then(() => {
        null != this.weixin.location && (i.lat = this.weixin.location.latitude, i.lng = this.weixin.location.longitude, this._sendEvent(i))
      }))
    })
  }
  sendVisitCloseEvent() {
    this._sendEvent({
      t: "cls",
      p: this.currentPage.path,
      q: this.currentPage.query
    })
  }
  sendErrorEvent(t) {
    if (t && t.length > 0) {
      let e = t[0].split("\n");
      if (e && e.length > 1) {
        let t = e[1].split(";");
        if (t && t.length > 1) {
          let n = t[1].match(/at ([^ ]+) page (.*) function/),
            i = {
              key: e[0],
              error: t[0]
            };
          n && n.length > 2 && (i.page = n[1], i.function = n[2]), this._sendEvent({
            t: "cstm",
            ptm: this.currentPage.time,
            p: this.currentPage.path,
            q: this.currentPage.query,
            n: "onError",
            var: i
          })
        }
      }
    }
  }
  sendPage(t) {
    var e = {
      t: "page",
      tm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query
    };
    this.lastPageEvent ? (e.rp = this.lastPageEvent.p, this.useLastPageTime && (e.tm = this.lastPageEvent.tm, this.useLastPageTime = !1)) : e.rp = this.scene ? `scn:${this.scene}` : null, t.data && t.data.pvar && (e.var = t.data.pvar);
    var n = this.weixin.getPageTitle(t);
    n && n.length > 0 && (e.tl = n), this._sendEvent(e), this.lastPageEvent = e;
    const i = this.currentPage.pvar[`${this.currentPage.path}?${this.currentPage.query}`];
    i && i.length > 0 && i.map(t => {
      t.ptm = this.currentPage.time, this._sendEvent(t)
    })
  }
  sendPageShare(t, e, n) {
    this._sendEvent({
      t: "cstm",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query,
      n: "onShareAppMessage",
      var: {
        from: e ? e.from : void 0,
        target: e && e.target ? e.target.id : void 0,
        title: n ? n.title : void 0,
        path: n ? decodeURI(n.path) : void 0
      }
    })
  }
  sendClick(t, e) {
    var n = {
        t: this.CLICK_TYPE[t.type] || "clck",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      },
      i = t.currentTarget,
      s = {
        x: `${i.id}#${e}`
      };
    i.dataset.title ? s.v = i.dataset.title : i.dataset.src && (s.h = i.dataset.src), void 0 !== i.dataset.index && (s.idx = /^[\d]+$/.test(i.dataset.index) ? parseInt(i.dataset.index) : -1), n.e = [s], this._sendEvent(n)
  }
  sendSubmit(t, e) {
    var n = {
      t: "sbmt",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query
    };
    n.e = [{
      x: `${t.currentTarget.id}#${e}`
    }], this._sendEvent(n)
  }
  sendChange(t, e) {
    var n = {
        t: "chng",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      },
      i = t.currentTarget,
      s = {
        x: `${i.id}#${e}`
      };
    if (-1 !== ["blur", "change", "confirm"].indexOf(t.type) && i.dataset.growingTrack) {
      if (!t.detail.value || 0 === t.detail.value.length) return;
      "string" == typeof t.detail.value ? s.v = t.detail.value : "[object Array]" === Object.prototype.toString.call(t.detail.value) && (s.v = t.detail.value.join(","))
    }
    "change" === t.type && t.detail && t.detail.source && "autoplay" === t.detail.source || (n.e = [s], this._sendEvent(n))
  }
  sendTabClick(t) {
    var e = {
      t: "clck",
      ptm: this.currentPage.time,
      p: this.currentPage.path,
      q: this.currentPage.query,
      e: [{
        x: "#onTabItemTap",
        v: t.text,
        idx: t.index,
        h: JSON.stringify(t.pagePath)
      }]
    };
    this._sendEvent(e)
  }
  _sendEvent(t) {
    if (t.u = this.weixin.uid, t.s = this.sessionId, t.tm = t.tm || Date.now(), t.d = this.growingio.appId, t.b = "MinP", null !== this.cs1 && (t.cs1 = this.cs1), t.var) {
      let e = t.var;
      Object.keys(e).forEach(n => {
        "string" != typeof e[n] && (t.var[n] = JSON.stringify(e[n]))
      })
    }
    this.growingio.upload(t)
  }
  _parseScene(t) {
    if (t.length > 0) {
      var e = t[0];
      e.query.wxShoppingListScene ? this.scene = e.query.wxShoppingListScene : e.scene && (this.scene = e.scene)
    }
  }
}
class Weixin {
  constructor(t) {
    this._location = null, this._systemInfo = null, this._uid = wx.getStorageSync("_growing_uid_"), this._uid && 36 !== this._uid.length && (t.forceLogin = !1), this._esid = wx.getStorageSync("_growing_esid_")
  }
  get location() {
    return this._location
  }
  get systemInfo() {
    return null == this._systemInfo && (this._systemInfo = wx.getSystemInfoSync()), this._systemInfo
  }
  set esid(t) {
    this._esid = t, wx.setStorageSync("_growing_esid_", this._esid)
  }
  get esid() {
    return this._esid || (this._esid = 1), this._esid
  }
  set uid(t) {
    this._uid = t, wx.setStorageSync("_growing_uid_", this._uid)
  }
  get uid() {
    return this._uid || (this.uid = Utils.guid()), this._uid
  }
  syncStorage() {
    wx.getStorageSync("_growing_uid_") || wx.setStorageSync("_growing_uid_", this._uid)
  }
  requestLocation(t) {
    return new Promise(e => {
      this._getLocation(t).then(t => (this._location = t, e(t)))
    })
  }
  getNetworkType() {
    return new Promise(t => {
      wx.getNetworkType({
        success: e => t(e),
        fail: () => t(null)
      })
    })
  }
  getPageTitle(t) {
    var e = "";
    try {
      if (t.data.title && t.data.title.length > 0 && (e = Array.isArray(t.data.title) ? t.data.title.join(" ") : t.data.title), 0 === e.length && __wxConfig) {
        if (__wxConfig.tabBar) {
          var n = __wxConfig.tabBar.list.find(e => e.pathPath == t.route || e.pagePath == `${t.route}.html`);
          n && n.text && (e = n.text)
        }
        if (0 == e.length) {
          var i = __wxConfig.page[t.route] || __wxConfig.page[`${t.route}.html`];
          e = i ? i.window.navigationBarTitleText : __wxConfig.global.window.navigationBarTitleText
        }
      }
    } catch (t) {}
    return e
  }
  _getSetting() {
    return new Promise(t => {
      wx.getSetting({
        success: t,
        fail: t
      })
    })
  }
  _getLocation(t) {
    return new Promise(e => {
      wx.getLocation({
        type: t,
        success: e,
        fail: function() {
          return e(null)
        }
      })
    })
  }
}
var setShareResult = t => {
    var e = VdsInstrumentAgent.observer.growingio;
    e && e.followShare && t && t.path && (t.path = -1 === t.path.indexOf("?") ? t.path + "?suid=" + e.weixin.uid : t.path + "&suid=" + e.weixin.uid)
  },
  VdsInstrumentAgent = {
    defaultPageCallbacks: {},
    defaultAppCallbacks: {},
    appHandlers: ["onShow", "onHide", "onError"],
    pageHandlers: ["onLoad", "onShow", "onShareAppMessage", "onTabItemTap", "onHide", "onUnload"],
    actionEventTypes: ["tap", "longpress", "blur", "change", "submit", "confirm", "getuserinfo", "getphonenumber", "contact"],
    originalPage: Page,
    originalApp: App,
    originalComponent: Component,
    originalBehavior: Behavior,
    hook: function(t, e) {
      return function() {
        var n, i = arguments ? arguments[0] : void 0;
        if (i && i.currentTarget && -1 != VdsInstrumentAgent.actionEventTypes.indexOf(i.type)) try {
          VdsInstrumentAgent.observer.actionListener(i, t)
        } catch (t) {
          console.error(t)
        }
        if (this._growing_app_ && "onShow" !== t ? n = e.apply(this, arguments) : this._growing_page_ && -1 === ["onShow", "onLoad", "onTabItemTap", "onHide", "onUnload"].indexOf(t) ? n = e.apply(this, arguments) : this._growing_app_ || this._growing_page_ || (n = e.apply(this, arguments)), this._growing_app_ && -1 !== VdsInstrumentAgent.appHandlers.indexOf(t)) {
          try {
            VdsInstrumentAgent.defaultAppCallbacks[t].apply(this, arguments)
          } catch (t) {
            console.error(t)
          }
          "onShow" === t && (n = e.apply(this, arguments))
        }
        if (this._growing_page_ && -1 !== VdsInstrumentAgent.pageHandlers.indexOf(t)) {
          var s = Array.prototype.slice.call(arguments);
          n && s.push(n);
          try {
            VdsInstrumentAgent.defaultPageCallbacks[t].apply(this, s)
          } catch (t) {
            console.error(t)
          } - 1 !== ["onShow", "onLoad", "onTabItemTap", "onHide", "onUnload"].indexOf(t) ? n = e.apply(this, arguments) : setShareResult(n)
        }
        return n
      }
    },
    hookComponent: function(t, e) {
      return function() {
        var n = arguments ? arguments[0] : void 0;
        if (n && n.currentTarget && -1 != VdsInstrumentAgent.actionEventTypes.indexOf(n.type)) try {
          VdsInstrumentAgent.observer.actionListener(n, t)
        } catch (t) {
          console.error(t)
        }
        return e.apply(this, arguments)
      }
    },
    instrument: function(t) {
      for (var e in t) "function" == typeof t[e] && (t[e] = this.hook(e, t[e]));
      return t._growing_app_ && VdsInstrumentAgent.appHandlers.map(function(e) {
        t[e] || (t[e] = VdsInstrumentAgent.defaultAppCallbacks[e])
      }), t._growing_page_ && VdsInstrumentAgent.pageHandlers.map(function(e) {
        t[e] || "onShareAppMessage" === e || (t[e] = VdsInstrumentAgent.defaultPageCallbacks[e])
      }), t
    },
    instrumentTaroPageComponent: function(t) {
      if (t.methods) {
        let e = t.methods;
        for (let n in e)
          if ("function" == typeof e[n] && -1 != VdsInstrumentAgent.pageHandlers.indexOf(n)) {
            const i = e[n];
            t.methods[n] = function() {
              VdsInstrumentAgent.observer.pageListener(this, n, arguments);
              const t = i.apply(this, arguments);
              return "onShareAppMessage" === n && setShareResult(t), t
            }
          }
      }
      return t
    },
    instrumentUniappPageComponent: function(t) {
      return VdsInstrumentAgent.pageHandlers.map(function(e) {
        if ("function" == typeof t[e]) {
          const n = t[e];
          t[e] = function() {
            VdsInstrumentAgent.observer.pageListener(this, e, arguments);
            const t = n.apply(this, arguments);
            return "onShareAppMessage" === e && setShareResult(t), t
          }
        } else t[e] = function() {
          VdsInstrumentAgent.observer.pageListener(this, e, arguments)
        }
      }), t
    },
    instrumentComponent: function(t) {
      if (t.methods) {
        let e = t.methods;
        for (let n in e) "function" == typeof e[n] && (t.methods[n] = this.hookComponent(n, e[n]))
      }
      return t
    },
    GrowingPage: function(t) {
      return t._growing_page_ = !0, VdsInstrumentAgent.originalPage(VdsInstrumentAgent.instrument(t))
    },
    GrowingComponent: function(t) {
      return VdsInstrumentAgent.originalComponent(VdsInstrumentAgent.instrumentComponent(t))
    },
    GrowingBehavior: function(t) {
      return VdsInstrumentAgent.originalBehavior(VdsInstrumentAgent.instrumentComponent(t))
    },
    GrowingApp: function(t) {
      return t._growing_app_ = !0, VdsInstrumentAgent.originalApp(VdsInstrumentAgent.instrument(t))
    },
    initInstrument: function(t, e) {
      VdsInstrumentAgent.observer = t, VdsInstrumentAgent.pageHandlers.forEach(function(t) {
        VdsInstrumentAgent.defaultPageCallbacks[t] = function() {
          this.__route__ && VdsInstrumentAgent.observer.pageListener(this, t, arguments)
        }
      }), VdsInstrumentAgent.appHandlers.forEach(function(t) {
        VdsInstrumentAgent.defaultAppCallbacks[t] = function() {
          VdsInstrumentAgent.observer.appListener(this, t, arguments)
        }
      }), e ? (global.GioPage = VdsInstrumentAgent.GrowingPage, global.GioApp = VdsInstrumentAgent.GrowingApp, global.GioComponent = VdsInstrumentAgent.GrowingComponent, global.GioBehavior = VdsInstrumentAgent.GrowingBehavior, global.trackApp = function() {
        const t = arguments[0];
        return t._growing_app_ = !0, VdsInstrumentAgent.instrument(t)
      }, global.trackPage = function() {
        const t = arguments[0];
        return t._growing_page_ = !0, VdsInstrumentAgent.instrument(t)
      }, global.trackComponent = function() {
        return VdsInstrumentAgent.instrument(arguments[0])
      }, global.trackBehavior = function() {
        return VdsInstrumentAgent.instrument(arguments[0])
      }) : (Page = function() {
        return VdsInstrumentAgent.GrowingPage(arguments[0])
      }, App = function() {
        return VdsInstrumentAgent.GrowingApp(arguments[0])
      }, Component = function() {
        return VdsInstrumentAgent.GrowingComponent(arguments[0])
      }, Behavior = function() {
        return VdsInstrumentAgent.GrowingBehavior(arguments[0])
      })
    }
  };
const duration5min = 3e5;
class GrowingIO {
  constructor() {
    this.uploadingMessages = [], this.start = !1
  }
  init(t, e, n = {}) {
    this.start || (this.start = !0, this.projectId = t, "string" == typeof e ? this.appId = e : (n = e, this.appId = Utils.getAppId()), this.appVer = n.version, this.debug = n.debug || !1, this.forceLogin = n.forceLogin || !1, this.followShare = void 0 === n.followShare || n.followShare, this.usePlugin = n.usePlugin || !1, this.getLocation = ("object" == typeof n.getLocation ? n.getLocation.autoGet : n.getLocation) || !1, this.getLocationType = "object" == typeof n.getLocation && n.getLocation.type || "wgs84", this.keepAlive = +n.keepAlive || duration5min, this.vue = !!n.vue, this.taro = !!n.taro, this.dataCollect = !(n.stopTrack && !n.dataCollect), this.weixin = new Weixin(this), this.esid = this.weixin.esid, this.host = "https://wxapi.growingio.com", n.host && n.host.indexOf("http") >= 0 && (this.host = "https://" + n.host.slice(n.host.indexOf("://") + 3)), this.uploader = new Uploader(this), this.observer = new Observer(this), this.start = !0, n.vue && (this.vueRootVMs = {}, this._proxyVue(n.vue)), n.taro && (this.taroRootVMs = {}, this._proxyTaro(n.taro)), n.cml && this._proxyCml(n.cml), this._start())
  }
  setVue(t) {
    this.vueRootVMs || (this.vueRootVMs = {}), this.vue = !0, this._proxyVue(t)
  }
  setDataCollect(t) {
    this.dataCollect = t
  }
  login(t) {
    if (this.forceLogin)
      for (var e of (this.weixin.uid = t, this.forceLogin = !1, this.uploadingMessages)) e.u = t, this._upload(e)
  }
  upload(t) {
    this.dataCollect && (this.forceLogin ? this.uploadingMessages.push(t) : this._upload(t))
  }
  forceFlush() {
    this.weixin.esid = this.esid, this.uploader.forceFlush()
  }
  proxy(t, e) {
    try {
      if ("setVue" === t) this.setVue(e[0]);
      else if ("setDataCollect" === t) this.setDataCollect(e[0]);
      else if ("setStopTrack" === t) this.setDataCollect(!e[0]);
      else if (this.observer && this.observer[t]) return this.observer[t].apply(this.observer, e)
    } catch (t) {
      console.error(t)
    }
  }
  _start() {
    VdsInstrumentAgent.initInstrument(this.observer, this.usePlugin);
    try {
      global && (global.App = App, global.Page = Page, global.Component = Component)
    } catch (t) {
      console.error(t)
    }
  }
  _upload(t) {
    t.esid = this.esid++, this.debug && console.info("generate new event", JSON.stringify(t, 0, 2)), gioEmitter.emitEvent("upload", [t]), this.uploader.upload(t)
  }
  _proxyTaro(t) {
    let e = this;
    const n = t.createComponent;
    t.createComponent = function(t, i) {
      let s = t;
      for (; s && s.prototype;) {
        const n = Object.keys(Object.getOwnPropertyDescriptors(s.prototype) || {});
        for (let i = 0; n.length > i; i++)
          if (n[i].startsWith("func__")) {
            const r = s.name,
              o = n[i].slice(6);
            e.taroRootVMs[n[i]] = r + "_" + ("" + t.prototype[n[i]]).match(/this\.__triggerPropsFn\(\"(.+)\",/)[1] + "_" + o
          }
        s = Object.getPrototypeOf(s)
      }
      const r = n(t, i);
      return i && VdsInstrumentAgent.instrumentTaroPageComponent(r), r
    }
  }
  _proxyCml(t) {
    const e = t.createApp;
    t.createApp = function(t) {
      const n = e(t);
      return VdsInstrumentAgent.GrowingApp(n.options), n
    }
  }
  _proxyVue(t) {
    if (void 0 !== t.mixin) {
      let e = this;
      t.mixin({
        created: function() {
          if (!this.$options.methods) return;
          const t = Object.keys(this.$options.methods);
          for (let e of Object.keys(this)) 0 > t.indexOf(e) || "function" != typeof this[e] || (Object.defineProperty(this[e], "proxiedName", {
            value: e
          }), Object.defineProperty(this[e], "isProxied", {
            value: !0
          }))
        },
        beforeMount: function() {
          let t = this.$root;
          t.$mp && "page" === t.$mp.mpType ? t.$mp.page && (e.vueRootVMs[t.$mp.page.route] = t) : "page" === t.mpType && t.$mp.page && (e.vueRootVMs[t.$mp.page.route] || (e.vueRootVMs[t.$mp.page.route] = t, VdsInstrumentAgent.instrumentUniappPageComponent(t.$mp.page)))
        }
      })
    }
  }
}
const growingio = new GrowingIO;
var gio = function() {
  var t = arguments[0];
  if (t) {
    var e = 2 > arguments.length ? [] : [].slice.call(arguments, 1);
    if ("init" !== t) return growingio.proxy(t, e);
    if (e.length < 2) console.log("初始化 GrowingIO SDK 失败。请使用 gio('init', '你的GrowingIO项目ID', '你的微信APP_ID', options);");
    else growingio.init(e[0], e[1], e[2])
  }
};
if (console.log("init growingio..."), Utils.compareVersion(Utils.sdkVer, "1.9.0") >= 0 && !growingio.start) {
  const t = require("./gioConfig").default;
  t.appId ? growingio.init(t.projectId, t.appId, t) : growingio.init(t.projectId, t)
}
const GioPage = VdsInstrumentAgent.GrowingPage,
  GioApp = VdsInstrumentAgent.GrowingApp,
  GioComponent = VdsInstrumentAgent.GrowingComponent,
  GioBehavior = VdsInstrumentAgent.GioBehavior,
  gioEmitter$1 = gioEmitter;
global.__growing__ = {
  gioEmitter: gioEmitter$1,
  gio: gio,
  growingio: growingio
}, exports.GioApp = GioApp, exports.GioBehavior = GioBehavior, exports.GioComponent = GioComponent, exports.GioPage = GioPage, exports.default = gio, exports.gioEmitter = gioEmitter$1, exports.growingio = growingio, exports.Utils = Utils;;