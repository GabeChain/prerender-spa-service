const axios = require('axios')
const qs = require('qs')

const asyncAxios = {
  async get (url, data) {
    try {
      let res = await axios.get(url, {params: data})
      res = res.data
      return new Promise((resolve, reject) => {
        resolve(res)
      })
    } catch (err) {
      console.log(err)
      return '服务器出错'
    }
  },
  async post (url, data) {
    try {
      let res = await axios.post(url, qs.stringify(data))
      res = res.data
      return new Promise((resolve, reject) => {
        resolve(res)
      })
    } catch (err) {
      console.log(err)
      return '服务器出错'
    }
  },
}
module.exports = asyncAxios