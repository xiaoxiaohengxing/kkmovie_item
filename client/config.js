/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://hsz7mrzd.qcloud.la';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        // 获得电影列表接口
        movieList: `${host}/weapp/movie`,
        // 获得电影详情接口
        movieDetail: `${host}/weapp/movie/`,

        // 添加影评
        addComment: `${host}/weapp/comment`,
        // 获得影评列表
        commentList: `${host}/weapp/comment`,
        // 获得影评详情
        commentDetail: `${host}/weapp/comment/`,
        // 获得推荐影评
        commentRecommend: `${host}/weapp/comment/recommend`,
        // 获得用户发布的影评
        userComment: `${host}/weapp/comment/user`,

        // 更新收藏状态
        updateCollection: `${host}/weapp/collection`,
        // 获取收藏影评列表
        collectionList: `${host}/weapp/collection`
    }
};

module.exports = config;
