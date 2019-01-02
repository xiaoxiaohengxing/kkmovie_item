// 登录授权接口
const DB = require('../utils/db.js')

module.exports = {
  /**
   * 获取电影列表
   */
  list: async ctx => {
    ctx.state.data = await DB.query("Select * from movie");
  },
  /**
   * 获取电影详情
   */
  detail: async ctx => {
    const movieId = + ctx.params.id
    if (!isNaN(movieId)) {
      ctx.state.data = (await DB.query("Select * from movie where id = ?", [movieId]))[0]
    } else {
      ctx.state.data = {}
    }
  }
}