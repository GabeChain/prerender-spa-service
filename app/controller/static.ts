import { Controller } from 'egg';
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
/**
 * @Controller
 */
export default class StaticController extends Controller {
  
  /**
   * @summary 预加工url HTML
   * @description spa源html动态行为打上标记，为避免重复添加的标签做准备工作
   * @router get /markStatic
   * @request query string *url eg:https://umijs.org/zh/ 代理Url地址
   * @response 200
   */
  public async mark() {
    const { ctx, service } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.markHtml(url) : { title: 'url无效', html: '404' };
    ctx.status = 200;
    ctx.body = pageObj.html;
  }

  /**
   * @summary 静态化spa渲染
   * @description 通过/markStatic代理，将标记的动态行为剔除，实现预渲染服务
   * @router get /renderStatic
   * @request query string *url eg:https://umijs.org/zh/ 静态化渲染的Url地址
   * @response 200
   */
  public async render() {
    const { ctx, service, config } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.renderPage(`http://127.0.0.1:${config.cluster.listen.port}/markStatic?url=${encodeURIComponent(url)}`) : null;
    ctx.status = 200;
    ctx.body = pageObj.html;
  }

  /**
   * @summary 预渲染spa html文件下载
   * @description spa应用 预渲染html文件下载
   * @router get /downloadStatic
   * @request query string *url eg:https://umijs.org/zh/ 静态化渲染的Url地址
   * @response 200
   */
  public async download() {
    const { ctx, service, config, app } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.renderPage(`http://127.0.0.1:${config.cluster.listen.port}/markStatic?url=${encodeURIComponent(url)}`) : null;
    const htmlId = shortid.generate();
    const htmlPath = path.resolve(app.config.template.dir, `${htmlId}.html`);
    if (!fs.existsSync(app.config.template.dir)) {
      fs.mkdirSync(app.config.template.dir)
    }
    // 写入html文件
    fs.writeFile(htmlPath, pageObj.html, (err: any) => {
      err ? console.log(err) : null
    });

    ctx.attachment(htmlPath);
    ctx.set('Content-Type', 'application/octet-stream');
    ctx.set('Content-Disposition', `attachment;filename=${encodeURI(pageObj.title).toString()}.html`);
    ctx.body = fs.createReadStream(htmlPath);
  }

  /**
   * @summary spa纯静态样式 离线HTML渲染
   * @description spa应用 离线html文件渲染
   * @router get /renderOffLine
   * @request query string *url eg:https://umijs.org/zh/ 静态化渲染的Url地址
   * @response 200
   */
  public async renderOffLine() {
    const { ctx, service } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.offlinePage(url) : null;
    ctx.status = 200;
    ctx.body = pageObj.html;
  }
}
