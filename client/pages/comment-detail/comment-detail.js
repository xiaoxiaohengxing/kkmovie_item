const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const util = require('../../utils/util.js');
const app = getApp();
const constant = require('../../constant.js');

const innerAudioContext = wx.createInnerAudioContext()

Page({
  data: {
    comment: null,
    userComments: null,
    audioStatus: constant.UNPLAYING,
    userInfo: null,
    starStatus: null
  },
  /**
   * 监听页面加载完成事件
   * 获得影评详情
   * comment信息中包含该用户收藏该影评的collectionId,用户对于该电影影评的userCommentId
   */
  onLoad: function (options) {
    let commentId = options.commentId;
    this.getCommentDetail(commentId);
  },
  /**
   * 监听页面显示事件
   * 获取用户信息并设置音频参数
   */
  onShow() {
    app.login({
      success: userInfo => {
        console.log(userInfo)
        this.setData({
          userInfo: userInfo
        })
        this.setAudioOptions()

      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 绑定音频点击事件
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
   * 绑定收藏或取消收藏按钮事件
   * 提交数据库用于插入或删除一条记录
   */
  onTapStar() {
    let commentId = this.data.comment.commentId;
    // 待修改后的starStatus
    let starStatus = this.data.comment.collectionId ? constant.UNSTAR : constant.STARED;
    let text = this.data.comment.collectionId ? '取消收藏' : '收藏';
    wx.showLoading({
      title: '正在' + text
    })
    qcloud.request({
      url: config.service.updateCollection,
      method: 'POST',
      data: {
        commentId: commentId,
        starStatus: starStatus
      },
      success: result => {
        wx.hideLoading();
        this.getCommentDetail(commentId)
        if (!result.data.code) {
          wx.showToast({
            title: text + '成功'
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: text + '失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: text + '失败'
        })
      }
    })
  },
  /**
   * 绑定图片点击事件
   * 放大浏览大图
   */
  imgZoom() {
    wx.previewImage({
      current: this.data.comment.movieImage, // 当前显示图片的http链接
      urls: [this.data.comment.movieImage] // 需要预览的图片http链接列表
    })
  },
  /**
   * 绑定微信登录按钮点击事件
   */
  onTapLogin(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
    }
  },
  /**
   * 绑定我的影评按钮事件
   * 跳转至该用户对于该电影的影评
   */
  goToUserComment() {
    let commentId = this.data.userComments[0].commentId;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`
    })
  },
  /**
   * 绑定写影评按钮
   * 跳转至影评编辑页面
   */
  onTapEdit() {
    let movieId = this.data.comment.movieId;
    let commentType = this.data.comment.type;
    wx.showActionSheet({
      itemList: ['文字', '音频'],
      success: res => {
        if (res.tapIndex === 0) {
          // 文字
          commentType = 'text'
        } else {
          // 音频
          commentType = 'voice'
        }
        wx.navigateTo({
          url: `/pages/comment-edit/comment-edit?movieId=${movieId}&commentType=${commentType}`
        })
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 设置音频播放按钮
   */
  setAudioOptions() {
    innerAudioContext.onPlay(() => {
      this.setData({
        audioStatus: PLAYING
      })
    })
    innerAudioContext.onPause(() => {
      this.setData({
        audioStatus: UNPLAYING
      })
    })
    innerAudioContext.onStop(() => {
      this.setData({
        audioStatus: UNPLAYING
      })
    })
    innerAudioContext.onEnded(() => {
      this.setData({
        audioStatus: UNPLAYING
      })
    })
    innerAudioContext.onError((res) => {
    })
  },
  /**
   * 获得评论详情
   */
  getCommentDetail(commentId) {
    qcloud.request({
      url: config.service.commentDetail + commentId,
      method: 'GET',
      success: result => {
        console.log(result)
        console.log(this.data.userInfo)
        if (!result.data.code) {
          let comment = result.data.data;
          comment.createTime = util.formatTime(new Date(comment.createTime))
          comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
          this.setData({
            comment: comment
          })
          innerAudioContext.src = this.data.comment.content;
          // 获取登录用户的该电影的影评
          let movieId = comment.movieId;
          this.getUserComments(movieId);
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取影评失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '获取影评失败'
        })
      }
    })
  },
  /**
   * 获取用户对于该电影的影评，用于判断是否需要显示写影评按钮
   */
  getUserComments(movieId) {
    qcloud.request({
      url: config.service.userComment + `?movieId=${movieId}`,
      success: result => {
        console.log(result)
        if (!result.data.code) {
          this.setData({
            userComments: result.data.data
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '用户影评加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '用户影评加载失败'
        })
      }
    });
  },
})