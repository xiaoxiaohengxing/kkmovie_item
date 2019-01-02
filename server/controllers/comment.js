// 登录授权接口
const DB = require('../utils/db.js')

module.exports = {
  /**
   * 随机返回一条非本人评论且本人未收藏的影评
   */
  getOne: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    ctx.state.data = (await DB.query("Select comment.id as commentId, comment.movie_id as movieId, comment.user_name as userName, comment.user_avatar as userAvatar, movie.title as movieTitle, movie.image as movieImage,rand() as tag from comment left join movie on comment.movie_id = movie.id where comment.user_id <> ? and comment.id not in (SELECT collection.comment_id from collection where collection.user_id = ?) order by tag desc LIMIT 1", [user, user]))[0] || null
  },
  /**
   * 获取用户发布的影评
   * 如果有movieId, 则返回该movieId下的该用户的影评
   */
  userList: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const {movieId} = ctx.request.query;
    if (!movieId) movieId = null
    ctx.state.data = await DB.query('Select comment.id as commentId, comment.content as content, comment.duration as duration, comment.type as type, comment.user_avatar as userAvatar, comment.user_name as userName, movie.image as movieImage, movie.title as movieTitle from comment left join movie on comment.movie_id = movie.id where user_id = ? and comment.movie_id = ifnull(?, comment.movie_id)', [user, movieId])
  },
  /**
   * 根据电影id获取影评列表
   */
  list: async ctx => {
    const { movieId } = ctx.request.query;
    if (!isNaN(movieId)) {
      ctx.state.data = await DB.query('Select id as id, movie_id as movieId, user_id as userId, user_name as userName, user_avatar as userAvatar, type as type, content as content, duration as duration, create_time as createTime from comment where movie_id = ? order by create_time desc', [movieId])
    }
  },
  /**
   * 根据影评id获取影评详情
   */
  detail: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const id = +ctx.params.id;
    if (!isNaN(id)) {
      ctx.state.data = (await DB.query('Select comment.id as commentId, comment.movie_id as movieId, comment.user_id as userId, comment.user_name as userName, comment.user_avatar as userAvatar, type as type, comment.content as content, comment.duration as duration, comment.create_time as createTime, movie.title as movieTitle, movie.image as movieImage, collection.id as collectionId from comment left join movie on comment.movie_id = movie.id left join collection on comment.id = collection.comment_id and collection.user_id = ? where comment.id = ?', [user, id]))[0] || []
    }
  },
  /**
   * 添加影评
   */
  add: async ctx => {
    const user = ctx.state.$wxInfo.userinfo.openId;
    const username = ctx.state.$wxInfo.userinfo.nickName;
    const avatar = ctx.state.$wxInfo.userinfo.avatarUrl;
    const { movieId, content, commentType, duration } = ctx.request.body;

    if (!isNaN(movieId)) {
      await DB.query('INSERT INTO comment(movie_id, user_id, user_name, user_avatar, type, content, duration) VALUES (?, ?, ?, ?, ?, ?, ?)', [movieId, user, username, avatar, commentType, content, duration])
    }
    ctx.state.data = {}
  }
}
