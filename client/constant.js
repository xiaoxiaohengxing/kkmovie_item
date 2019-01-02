// 播放状态
const UNPLAYING = 0
const PLAYING = 1

// 收藏状态
const UNSTAR = 0
const STARED = 1

// 录音状态
const UNRECORDED = 0
const RECORDING = 1
const RECORDED = 2

// 录音授权状态
const UNVERIFIED = 0 // 未验证
const UNAUTHORIZED = 1 // 未授权
const AUTHORIZED = 2 // 已授权

// 列表类型
const COLLECTION = 0
const PUBLISH = 1

module.exports = { UNPLAYING, PLAYING, UNSTAR, STARED, UNRECORDED, RECORDING, RECORDED, UNVERIFIED, UNAUTHORIZED, AUTHORIZED, COLLECTION, PUBLISH }