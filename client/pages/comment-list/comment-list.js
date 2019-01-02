const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const util = require('../../utils/util.js');
const constant = require('../../constant.js');
const app = getApp();
const innerAudioContext = wx.createInnerAudioContext()

Page({
  data: {
    comments: [],
    movieId: null,
    audioStatus: [] //各影评的影评播放状态，用户播放按钮渲染
  },
  /**
   * 监听页面加载事件
   * 根据电影id获取影评列表
   */
  onLoad: function (options) {
    let movieId = options.movieId;
    this.setData({
      movieId: movieId
    })
    this.setAudioOptions();
    this.getComments(movieId);
  },
  /**
   * 监听音频点击事件
   * 获取点击的影评的id，暂停其他的影评，播放改影评
   */
  onTapAudio(event) {
    let src = event.currentTarget.dataset.src;
    let index = event.currentTarget.dataset.index;
    innerAudioContext.src = src;
    let audioStatus = [];
    for (let i = 0; i < this.data.audioStatus.length; i++) {
      if (i === index) {
        audioStatus.push(constant.PLAYING);
      } else {
        audioStatus.push(constant.UNPLAYING);
      }
    }
    innerAudioContext.play()
    this.setData({
      audioStatus: audioStatus
    })
  },
  /**
   * 设置银屏播放参数
   */
  setAudioOptions() {
    innerAudioContext.onEnded(() => {
      let audioStatus = [];
      for (let i = 0; i < this.data.audioStatus.length; i++) {
          audioStatus.push(UNPLAYING);
      }
      this.setData({
        audioStatus: audioStatus
      })
    })
    innerAudioContext.onError((res) => {
    })
  },
  /**
   * 跳转至影评详情页面
   */
  goToCommentDetail(event) {
    let commentId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },
  /**
   * 跳转至首页
   */
  goToHome() {
    wx.navigateTo({
      url: '/pages/home/home'
    })
  },
  /**
   * 监听下拉刷新事件
   * 获取影评列表并更新
   */
  onPullDownRefresh() {
    this.getComments(this.data.movieId, () => {
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 获取影评列表函数
   */
  getComments(movieId, cb){
    wx.showLoading({
      title: '正在获取影评列表'
    })
    qcloud.request({
      url: config.service.commentList + `?movieId=${movieId}`,
      data: {
        movieId: movieId
      },
      method: 'GET',
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          /**
           * 此处将播放状态单独作为一个数组，是为了提高setData时的页面渲染速补，避免不必要的重新加载
           */
          let audioStatus = [];
          comments.forEach(comment => {
            comment.createTime = util.formatTime(new Date(comment.createTime))
            comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
            audioStatus.push(constant.UNPLAYING)
          })
          this.setData({
            comments: comments,
            audioStatus: audioStatus
          })
          wx.showToast({
            title: '获取影评成功'
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取影评失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '获取影评失败'
        })
      },
      complete: () => {
        cb && cb()
      }
    })
  }
})