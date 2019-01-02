const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    comment: null
  },
  /**
   * 监听加载事件
   * 登录并获取推荐的影评
   */
  onLoad: function (options) {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo
        })
        this.getRecommendComment();
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 监听点击登录按钮事件
   * 获取用户授权并获取推荐的影评
   */
  onTapLogin(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
      this.getRecommendComment();
    }
  },
  /**
   * 监听页面显示事件
   * 登录用户
   */
  onShow: function () {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo
        })
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 监听下拉刷新事件
   * 重新获取推荐的影评
   */
  onPullDownRefresh() {
    this.getRecommendComment(() => {
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 跳转至影评详情页
   */
  goToCommentDetail() {
    let commentId = this.data.comment.commentId;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },
  /**
   * 跳转至电影详情页
   */
  goToMovieDetail() {
    let movieId = this.data.comment.movieId;
    wx.navigateTo({
      url: '/pages/movie-detail/movie-detail?id=' + movieId,
    })
  },
  /**
   * 获取推荐的影评
   */
  getRecommendComment(cb) {
    wx.showLoading({
      title: '电影加载中'
    })
    qcloud.request({
      url: config.service.commentRecommend,
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          wx.showToast({
            icon: 'success',
            title: '电影加载完成'
          })
          this.setData({
            comment: result.data.data
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '电影加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '电影加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  }
})