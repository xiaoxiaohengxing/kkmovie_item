const qcloud = require('../../vendor/wafer2-client-sdk/index.js');
const config = require('../../config.js');

Page({
  data: {
    movies: [], // 于前台电影列表绑定的数据
    fullMovies: [], // 从后台获取的完整电影列表，用于每次前台过滤
    searchContent: '' // 搜索框文字
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMovieList();
  },
  /**
   * 监听搜索框输入事件
   * 前台过滤电影列表
   */
  onTapSearch(event) {
    let searchContent = event.detail.value
    this.setData({
      searchContent: searchContent
    })
    let movies = this.data.fullMovies.slice(0)
    this.filterMovies(movies);
  },
  /**
   * 监听下拉刷新事件
   * 获取电影列表
   */
  onPullDownRefresh: function () {
    this.getMovieList(() => {
      wx.stopPullDownRefresh();
    })
  },
  /**
   * 跳转至电影详情
   */
  goToDetail(event) {
    let movieId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/movie-detail/movie-detail?id=' + movieId,
    })
  },
  /**
   * 过滤电影列表函数
   * 支持电影名称或者电影标签搜索
   */
  filterMovies(movies) {
    let searchContent = this.data.searchContent
    let searchMovies = movies.filter(m => m.title.indexOf(searchContent) >= 0 || m.category.indexOf(searchContent) >= 0)
    this.setData({
      movies: searchMovies
    })
  },
  /**
   * 获取电影列表函数，并重置搜索框条件
   */
  getMovieList(cb) {
    wx.showLoading({
      title: '电影列表加载中'
    })
    qcloud.request({
      url: config.service.movieList,
      success: result => {
        if (!result.data.code && result.data.data !== {}) {
          let movies = result.data.data;
          this.setData({
            movies: result.data.data,
            fullMovies: movies,
            searchContent: ''
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: '电影列表加载失败'
          })
        }
      },
      fail: error => {
        console.log(error)
        wx.showToast({
          icon: 'none',
          title: '电影列表加载失败'
        })
      },
      complete: result => {
        wx.hideLoading();
        cb && cb()
      }
    });
  },
})