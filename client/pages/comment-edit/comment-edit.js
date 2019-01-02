const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const constant = require('../../constant.js');
const app = getApp();

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()

Page({
  data: {
    recordStatusTip: ['按 住 录 音', '松 开 结 束', '重 新 录 制'], //录音按钮的文字显示与状态的对应关系
    userInfo: null,
    movie: null,
    commentContent: "", //文本内容，只有在影评内容是text时起效
    commentType: 'text', // 影评类型，默认为文本
    editMode: true, // 是否处于编辑状态
    recordStatus: constant.UNRECORDED, // 录音状态，默认处于未录音
    recordAudio: null, // 音频对象，只有在影评内容是voice时起效
    audioStatus: constant.UNPLAYING, // 音频播放状态
    recordAuthStatus: constant.UNVERIFIED // 录音授权状态
  },
  /**
   * 监听页面加载事件
   * 绑定影评类型
   * 获取电影详情
   */
  onLoad: function(options) {
    let commentType = options.commentType
    let movieId = options.movieId
    this.setData({
      commentType: commentType
    })
    this.getRecordAuth(false);
    this.getMovie(movieId);
  },
  /**
   * 监听页面显示
   * 登录并设置设置录音状态和参数
   */
  onShow() {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo,
          recordStatus: constant.UNRECORDED
        })
        this.setAudioOptions()
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 微信登录按钮绑定事件
   * 获取用户信息
   */
  onTapLogin(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
    }
  },
  /**
   * 完成按钮点击事件
   * 修改编辑状态为预览状态，并修改导航栏标题
   */
  onTapFinishBtn() {
    this.setData({
      editMode: false
    })
    wx.setNavigationBarTitle({
      title: '影评预览'
    })
  },
  /**
   * 返回编辑按钮点击事件
   * 修改编辑状态为编辑状态，并修改导航栏标题
   */
  onTapEditBack() {
    this.setData({
      editMode: true
    })
    wx.setNavigationBarTitle({
      title: '编辑影评'
    })
  },
  /**
   * 绑定用户输入文字影评事件
   * 绑定commentContent数据
   */
  onInputComment(event) {
    this.setData({
      commentContent: event.detail.value
    })
  },
  /**
   * 获取用户的录音权限
   * ifAskAuth用于区分登录时或是点击录音按钮检查状态
   * 登录时只判断当前用户授权状态，但不做操作，如果是未验证点击录音按钮则要求用户授权录音
   */
  getRecordAuth(ifAskAuth) {
    // 获取用户录音授权状态
    wx.getSetting({
      success: (res) => {
        let auth = res.authSetting['scope.record']
        if (auth === undefined) {
          if (ifAskAuth) {
            wx.authorize({
              scope: 'scope.record',
              success: () => {
                // 已授权
                this.setData({
                  recordAuthStatus: constant.AUTHORIZED
                })
              },
              fail: error => {
                console.log(error)
                // 未授权
                this.setData({
                  recordAuthStatus: constant.UNAUTHORIZED
                })
              }
            })
          }
        } else if (auth === false) {
          // 未授权
          this.setData({
            recordAuthStatus: constant.UNAUTHORIZED
          })
        } else if (auth === true) {
          // 已授权
          this.setData({
            recordAuthStatus: constant.AUTHORIZED
          })
        }
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 监听音频点击事件
   * 播放或暂停音频
   */
  onTapAudio() {
    if (this.data.audioStatus === constant.UNPLAYING) {
      innerAudioContext.play()
    } else if (this.data.audioStatus === constant.PLAYING) {
      innerAudioContext.pause()
    }
  },
  /**
   * 设置音频参数
   */
  setAudioOptions() {
    innerAudioContext.onPlay(() => {
      this.setData({
        audioStatus: constant.PLAYING
      })
    })
    innerAudioContext.onPause(() => {
      this.setData({
        audioStatus: constant.UNPLAYING
      })
    })
    innerAudioContext.onStop(() => {
      this.setData({
        audioStatus: constant.UNPLAYING
      })
    })
    innerAudioContext.onEnded(() => {
      this.setData({
        audioStatus: constant.UNPLAYING
      })
    })
    innerAudioContext.onError(error => {
      console.log(error)
    })
  },
  /**
   * 录音授权openSetting结束后的回调函数
   * 根据回调函数返回值设置授权状态
   */
  settingCallBack(event) {
    console.log(event)
    let auth = event.detail.authSetting['scope.record']

    if (auth === false) {
      this.setData({
        recordAuthStatus: constant.UNAUTHORIZED
      })
    } else {
      this.setData({
        recordAuthStatus: constant.AUTHORIZED
      })
    }
  },
  /**
   * 绑定录音按钮按下事件
   * 未验证则请求用户授权，不会触发endRecord事件
   * 授权后手机轻微振动
   * 音频播放停止，防止用户的音频还在播放导致重新录制有杂音
   */
  startRecord() {
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    }
    if (this.data.recordAuthStatus === constant.UNVERIFIED) {
      this.getRecordAuth(true)
    } else if (this.data.recordAuthStatus === constant.AUTHORIZED) {
      recorderManager.onStart(() => {
        wx.vibrateShort();
        innerAudioContext.stop()
        this.setData({
          recordStatus: constant.RECORDING,
          recordAudio: null
        })
      })
      recorderManager.start(options)
    }
  },
  /**
   * 绑定录音按钮抬起事件
   * 录音未验证不会进入该事件
   * 获得音频修改音频对象recordAudio
   */
  endRecord() {
    // if (this.data.recordAuthStatus === AUTHORIZED) {
      recorderManager.stop()
      recorderManager.onStop((res) => {
        res['durationText'] = Math.floor(res.duration / 1000 * 100) / 100 + "''"
        this.setData({
          recordAudio: res,
          recordStatus: constant.RECORDED
        })
        innerAudioContext.src = res.tempFilePath
      })
    // }
  },
  /**
   * 获得电影详情
   */
  getMovie(movieId) {
    wx.showLoading({
      title: '电影详情加载中'
    })
    qcloud.request({
      url: config.service.movieDetail + movieId,
      success: result => {
        if (!result.data.code && result.data.data !== {}) {
          this.setData({
            movie: result.data.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '电影详情加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '电影详情加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
      }
    });
  },
  /**
   * 向服务器添加评论，
   * comment：文字评论时指的是文字内容，音频评论时指的是音频url地址
   */
  addComment(movieId, comment, commentType, duration) {
    wx.showLoading({
      title: '正在发布影评'
    })
    // comment = comment.replace(/\\/g, '\\\\');
    qcloud.request({
      url: config.service.addComment,
      data: {
        movieId: movieId,
        content: comment,
        commentType: commentType,
        duration: duration
      },
      method: 'POST',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          wx.showToast({
            title: '发布影评成功'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/comment-list/comment-list?movieId=' + movieId
            })
          }, 1500)
        } else {
          wx.showToast({
            icon: 'none',
            title: '发布影评失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '发布影评失败'
        })
      }
    })
  },
  /**
   * 上传音频文件到腾讯云存储桶
   */
  uploadVoice(cb) {
    let url = this.data.recordAudio.tempFilePath;
    wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: url,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: res => {
        console.log(res)
        let content = JSON.parse(res.data).data.imgUrl;
        cb && cb(content)
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 绑定发布影评按钮
   * 根据影评类型做相应操作
   * 文字影评直接上传数据库
   * 音频影评先将音频上传至对象存储，将返回的对象存储url上传数据库
   */
  sendComment() {
    let movieId = this.data.movie.id;
    let comment = this.data.commentContent;
    let commentType = this.data.commentType;
    let duration = this.data.recordAudio ? this.data.recordAudio.duration : null;
    if (commentType === 'text') {
      this.addComment(movieId, comment, commentType, duration)
    } else if (commentType === 'voice') {
      this.uploadVoice((content) => {
        this.addComment(movieId, content, commentType, duration)
      })
    }
  }
})