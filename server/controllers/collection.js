// 登录授权接口
const DB = require('../utils/db.js')
// 收藏状态
const UNSTAR = 0
const STARED = 1

module.exports = {
  /**
   * 更新用户收藏影评状态
   * starStatus: 更新后的状态
   * 如果需要收藏，则往数据库中插入对应信息
   * 如果是取消收藏，则从数据库中删除对应信息
   */
  update: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const { commentId, starStatus } = +ctx.request.body;
    if (!isNaN(commentId)) {
      if (starStatus === UNSTAR) {
        await DB.query('Delete from collection where user_id = ? and comment_id = ?', [user, commentId])
      } else if (starStatus === STARED){
        await DB.query('Insert into collection (user_id, comment_id) values (?, ?)', [user, commentId])
      }
    }
  },
  /**
   * 获取用户的收藏影评列表
   */
  list: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = await DB.query('SELECT comment_movie.commentId, comment_movie.movieImage, comment_movie.movieTitle, comment_movie.userName, comment_movie.userAvatar, comment_movie.content, comment_movie.duration, comment_movie.type FROM collection LEFT JOIN ( SELECT comment.id as commentId, movie.image as movieImage, movie.title as movieTitle, comment.user_name as userName, comment.user_avatar as userAvatar, comment.content as content, comment.duration as duration, comment.type as type from comment LEFT JOIN movie ON comment.movie_id = movie.id ) AS comment_movie ON collection.comment_id = comment_movie.commentId WHERE collection.user_id = ?', [user])
  }
}
