const initPuppeteerPool = require('./utils/puppeteer-pool.js')
const { EventEmitter } = require('events')
EventEmitter.defaultMaxListeners = 30
class AppBootHook {
  constructor(app) {
    this.app = app
  }
  //以下为egg的生命周期
  configWillLoad() {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
    // 注意：此函数只支持同步调用
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务

    // 实例化puppeteer实例池
    this.app.pool = initPuppeteerPool({
      puppeteerArgs: {
        ignoreHTTPSErrors: true,
        headless: true, // 是否启用无头模式页面
        timeout: 0,
        pipe: true, // 不使用 websocket 
        args: ['--ignore-certificate-errors',
          '--allow-running-insecure-content',
          '--disable-xss-auditor',
          '--no-sandbox',
          '--disable-setuid-sandbox']
      }
    })
  }

  async willReady() {
    // 所有的插件都已启动完毕，但是应用整体还未 ready
    // 可以做一些数据初始化等操作，这些操作成功才会启动应用
  }

  async didReady() {
    // 应用已经启动完毕
  }

  async beforeStart(){
    // await this.app.runSchedule('timeTask')
  }

  async beforeClose() {
    // 释放puppeteer实例池
    if (this.app.pool.drain) {
      await this.app.pool.drain().then(() => this.app.pool.clear())
    }
  }
  
  async serverDidReady() {
    
  }
}
module.exports = AppBootHook
