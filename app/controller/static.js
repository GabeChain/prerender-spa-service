const Controller = require('egg').Controller
const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

class StaticController extends Controller {
  async mark() {
    const {ctx, service} = this
    const url = decodeURIComponent(ctx.query.url)
    var pageObj = url ? await service.puppeteerService.markHtml(url) : {title: 'url无效',html: '404 Not Found'}
    ctx.status = 200
    ctx.body = pageObj.html
  }

  async render() {
    const {ctx, service, config} = this
    const url = decodeURIComponent(ctx.query.url)
    const pageObj = url ? await service.puppeteerService.renderPage(`http://127.0.0.1:${config.cluster.listen.port}/markStatic?url=${encodeURIComponent(url)}`) : null
    ctx.status = 200
    ctx.body = pageObj.html
  }

  async download() {
    const {ctx, service, config, app} = this
    const url = decodeURIComponent(ctx.query.url)
    const pageObj = url ? await service.puppeteerService.renderPage(`http://127.0.0.1:${config.cluster.listen.port}/markStatic?url=${encodeURIComponent(url)}`) : null
    const htmlId = shortid.generate()
    let htmlPath = path.resolve(app.config.template.dir, `${htmlId}.html`)
    // 写入html文件
    fs.writeFile(htmlPath, pageObj.html, (err) => {
      console.log(err)
    })

    ctx.attachment(htmlPath)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.set('Content-Disposition', `attachment;filename=${encodeURI(pageObj['title'], 'GBK').toString('iso8859-1')}.html`)
    ctx.body = fs.createReadStream(htmlPath)
  }

  async renderOffLine() {
    const {ctx, service, app} = this
    const url = decodeURIComponent(ctx.query.url)
    const pageObj = url ? await service.puppeteerService.offlinePage(url) : null
    ctx.status = 200
    ctx.body = pageObj.html
  }
}

module.exports = StaticController
