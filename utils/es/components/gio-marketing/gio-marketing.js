if (!global.__growing__) {
  console.error('未加载 gio SDK');
}
const gio = global.__growing__.gio;
const growingio = global.__growing__.growingio;
const gioEmitter = global.__growing__.gioEmitter;

let initAppSended = false;
!!!growingio.marketingHost && (growingio.marketingHost = 'https://messages.growingio.com')

function debounce(fn, delay) {
  var timer;
  return function () {
    var context = this;
    var args = [].slice.call(arguments);
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}

function getParameterByName(name, url) {
  if (typeof url !== 'string') {
    return;
  }
  url[0] !== '?' && (url = '?' + url);
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


class WxStorage {
  constructor(namespace) {
    this.namespace = namespace
  }
  key(k) {
    return "#" + this.namespace + "#" + k;
  }
  get(key) {
    return JSON.parse(wx.getStorageSync(this.key(key)));
  }
  set(key, v) {
    wx.setStorageSync(this.key(key), JSON.stringify(v));
  }
}

class StatusStorage extends WxStorage {
  get(key) {
    var v = wx.getStorageSync(this.key(key))
    if (!!v) {
      return JSON.parse(v)
    }
    this.set(key, {
      showTimes: 0
    })
    return this.get(key)
  }
  plus(key, num) {
    var v = this.get(key)
    v.showTimes = v.showTimes + num
    this.set(key, v)
  }
}
class Marketing {
  constructor() {
    console.log('Marketing 启动.')
    this.statusStorage = new StatusStorage('push-status');
    this.cs1 = gio('getUserId');
    this.bu = null;
    this.bcs = null;
    this.timer = null;
    this.messageId = null;
    this.isCreatedInstance = false;
    this.fetchedMessages = [];
    this.hasConsumeEvent = false;
    this.setCs1 = this.setCs1.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
    this.initSeveralState();

    this.startFetchPushMessageFromRemote = debounce(this.startFetchPushMessageFromRemote, 200);
  }
  static getInstance() {
    if (!this.marketing) {
      this.marketing = new Marketing();
    }
    return this.marketing;
  }
  //清除匹配到的消息
  clear() {
    this.fetchedMessages = [];
  }
  run(messageId) {
    if (messageId) {
      this.messageId = messageId;
    }
    if (!this.isCreatedInstance) {
      this.isCreatedInstance = true;
      this.startFetchPushMessageFromRemote();
      gioEmitter.on('appShow', () => {
        initAppSended = false;
      });
      gioEmitter.on('setCs1', this.setCs1);
    }
    if (!this.isRunning) {
      this.isRunning = true;
      // 监听用户事件
      gioEmitter.addListener('appOpen', this.handleEvent);
      gioEmitter.addListener('upload', this.handleEvent);
    }
  }
  stop() {
    gioEmitter.removeListener('upload', this.handleEvent);
    gioEmitter.removeListener('appOpen', this.handleEvent);
    this.initSeveralState();
  }

  initSeveralState() {
    this.listener = null;
    this.messageNeedToRender = [];
    this.unResolvedEvents = [];
    this.isRunning = false;
  }

  fetchPushMessageFromRemote() {
    let url = `${growingio.marketingHost}/v1/${growingio.projectId}/notifications${this.messageId ? '/preview' : ''}?url_scheme=${growingio.appId}${this.messageId ? `&message_id=${this.messageId}` : ''}`;

    // @todo 考虑 u的变化
    url += this.bu ? `&bu=${this.bu}` : `&u=${growingio.weixin.uid}`
    if (this.cs1) {
      url += this.bcs ? `&bcs=${this.bcs}` : `&cs=${this.cs1}`
    }
    const start = new Date().valueOf()
    wx.request({
      url, success: (data) => {
        const end = new Date().valueOf()
        this.bcs = data.data.idMappings.bcs;
        this.bu = data.data.idMappings.bu;
        this.fetchedMessages = this.refreshPushMessageFrmRemote(data.data.popupWindows);
        if (!this.hasConsumeEvent) {
          // 如果超过5秒钟，则情况所有未处理的事件
          if (end - start > 5000) {
            this.unResolvedEvents = [];
          }
          this.hasConsumeEvent = true;
          this.handleEvent();
        }
      }
    })
  }

  startFetchPushMessageFromRemote() {
    this.fetchedMessages = [];
    this.hasConsumeEvent = false;
    this.fetchPushMessageFromRemote();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.fetchPushMessageFromRemote();
    }, 30 * 60 * 1000)
  }

  refreshPushMessageFrmRemote(messages) {
    return messages.sort((a, b) => a.updateAt >= b.updateAt ? -1 : 1)
  }

  getValidMessages(event) {
    const actions = this.fetchedMessages.filter(message => this.validActionType(message, event));
    if (this.messageId) {
      return actions;
    }
    return actions
      .filter(_ => this.validTimeRange(_))
      .filter(_ => this.validateTimes(_))
  }

  validActionType(message, event) {
    return event.n === message.rule.action;
  }

  validTimeRange(message) {
    const now = new Date().valueOf()
    return (message.rule.startAt || 0) <= now && now < (message.rule.endAt || now + 1)
  }

  validateTimes(message) {
    var showTimes = this.statusStorage.get(message.id).showTimes;
    return showTimes < message.rule.limit;
  }

  onTrackImp(message) {
    gio('track', 'in_app_message_imp', { 'in_app_message_name': message.name })
    if (!this.messageId) {
      this.statusStorage.plus(message.id, 1)
    }
  }

  // @todo 展示下一个弹窗
  onCloseWindow(message) {
    gio('track', 'in_app_message_close', { 'in_app_message_name': message.name })
  }

  onClickTarget(message) {
    gio('track', 'in_app_message_cmp_click', { 'in_app_message_name': message.name })
    if (!this.messageId) {
      this.statusStorage.plus(message.id, 1000)
    }
    // 容错处理
    const target = message.contentMetadata.components[0].config.target[`growing.${growingio.appId}`]
    if (!!target) {
      this.navigateTo(target)
    }
  }

  navigateTo(url) {
    wx.navigateTo({
      url,
      fail: () => {
        wx.switchTab({ url })
      }
    })
  }

  handleEvent(event) {
    if (!!event) {
      if (event.t === 'cstm') {
        this.unResolvedEvents.push(event);
      } else if (event.t === 'page') {
        const messageId = getParameterByName('gioMessageId', event.q);
        if (messageId) {
          this.messageId = messageId;
        }
      }
    }
    if (this.hasConsumeEvent) {
      while (this.unResolvedEvents.length > 0) {
        event = this.unResolvedEvents.shift();
        if (event.t === 'cstm' && this.fetchedMessages.length > 0 && !event.n.startsWith('in_app_message_')) {
          this.messageNeedToRender = this.messageNeedToRender.concat(this.getValidMessages(event));
          this.dispatchMessage();
        }
      }
    }
  }

  registerOnceMessageListener(listener) {
    this.listener = listener;
    this.dispatchMessage();
  }

  dispatchMessage() {
    if (this.messageNeedToRender.length > 0 && !!this.listener) {
      var message = this.messageNeedToRender.shift();
      if (this.messageId) {
        this.listener(message)
        this.listener = undefined
      } else if (this.validateTimes(message)) {
        this.listener(message)
        this.listener = undefined
      } else {
        this.dispatchMessage();
      }
    }
  }

  setCs1(cs1) {
    this.cs1 = cs1;
    this.startFetchPushMessageFromRemote();
  }
}

const marketing = Marketing.getInstance();

Component({
  data: {
    message: undefined,
    visible: false,
  },
  pageLifetimes: {
    hide() {
      this.close();
    },
    show() {
      marketing.run();
      this.registerListener();
      if (!initAppSended) {
        gioEmitter.emit('appOpen', { t: 'cstm', n: 'appOpen' });
        initAppSended = true;
      }
    }
  },
  methods: {
    onClickTarget() {
      marketing.onClickTarget(this.data.message);
      this.hideModal();
      this.registerListener();
    },
    handleClose() {
      marketing.onCloseWindow(this.data.message);
      this.hideModal();
      this.registerListener();
    },
    handleTouchMove() {
      return;
    },
    registerListener() {
      marketing.registerOnceMessageListener(message => {
        this.setData({ message, visible: true })
      })
    },
    hideModal() {
      this.setData({ visible: false });
    },
    close() {
      marketing.stop();
      this.hideModal();
    }
  },
  observers: {
    'visible, message': function (visible, message) {
      if (visible) {
        marketing.onTrackImp(message)
      }
    }
  },
  attached() {
    marketing.run();
    this.registerListener();
  },
  detached() {
    this.close();
  }
})
