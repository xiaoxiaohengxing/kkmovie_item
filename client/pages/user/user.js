const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');
const constant = require('../../constant.js');
const app = getApp();

Page({
  data: {
    userInfo: null,
    comments: [],
    listType: constant.COLLECTION //列表类型，收藏或者发布
  },
  /**
   * 监听页面加载事件
   * 登录并获取列表
   */
  onLoad: function (options) {
    app.login({
      success: userInfo => {
        this.setData({
          userInfo: userInfo
        })
        this.getList();
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  /**
   * 监听页面显示事件
   * 用户登录
   */
  onShow: function () {
    app.login({
      success: (userInfo) => {
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
   * 监听列表类型点击事件
   * 修改列表类型，重新获取列表
   */
  onTapListType(event) {
    let listType = +event.currentTarget.dataset.type;
    this.setData({
      listType: listType
    })
    this.getList();
  },
  /**
   * 监听登录按钮点击事件
   * 获取用户授权更新userInfo
   */
  onTapLogin(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo
      })
    }
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
   * 跳转至影评详情页
   */
  goToCommentDetail(event) {
    let commentId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/comment-detail/comment-detail?commentId=${commentId}`,
    })
  },
  /**
   * 监听下拉刷新事件
   * 获取列表
   */
  onPullDownRefresh() {
    this.getList(() => {
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 获取收藏影评列表函数
   */
  getCollection(cb) {
    wx.showLoading({
      title: '收藏影评加载中'
    })
    qcloud.request({
      url: config.service.collectionList,
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          comments.forEach(comment => {
            comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
          })
          this.setData({
            comments: comments
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '收藏影评加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '收藏影评加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  },
  /**
   * 获取用户发布影评列表函数
   */
  getUserComments(cb) {
    wx.showLoading({
      title: '发布影评加载中'
    })
    qcloud.request({
      url: config.service.userComment,
      success: result => {
        wx.hideLoading();
        if (!result.data.code) {
          let comments = result.data.data;
          comments.forEach(comment => {
            comment['durationText'] = Math.floor(comment.duration / 1000 * 100) / 100 + "''"
          })
          this.setData({
            comments: comments
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '发布影评加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '发布影评加载失败'
        })
      },
      complete: result => {
        cb && cb()
      }
    })
  },
  /**
   * 根据列表类型调用不同函数获取列表
   */
  getList(cb){
    if (this.data.listType === constant.COLLECTION) {
      this.getCollection(cb);
    } else if (this.data.listType === constant.PUBLISH){
      this.getUserComments(cb);
    }
  }
})