const mysql = require('mysql')
const config = require('../config').mysql

var pool = null

/**
 * 鍒濆鍖栬繛鎺ユ睜
 */
function initMysqlPool() {
  pool = mysql.createPool({
    connectionLimit: 50,
    database: config.db,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.pass,
    charset: config.char
  });
}

module.exports = {
  /**
   * 鎵цsql鏌ヨ
   */
  query(sql, sqlParam, connection) {
    // 鎵撳嵃sql璇彞
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(sql, sqlParam, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
        })
      } else {
        if (!pool) {
          initMysqlPool()
        }

        pool.getConnection((err, connection) => {
          if (err) {
            reject(err)
          } else {
            connection.query(sql, sqlParam, (err, rows) => {
              connection.release()
              if (err) {
                reject(err)
              } else {
                resolve(rows)
              }
            })
          }
        })
      }
    })
  },
}