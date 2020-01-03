import { Controller } from 'egg';
import fs from 'fs';
import path from 'path';
import shortid from 'shortid';

export default class StaticController extends Controller {
  
  public async mark() {
    const { ctx, service } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.markHtml(url) : { title: 'url无效', html: '404' };
    ctx.status = 200;
    ctx.body = pageObj.html;
  }

  public async render() {
    const { ctx, service, config } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.renderPage(`http://127.0.0.1:${config.cluster.listen.port}/markStatic?url=${encodeURIComponent(url)}`) : null;
    ctx.status = 200;
    ctx.body = pageObj.html;
  }

  public async download() {
    const { ctx, service, config, app } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.renderPage(`http://127.0.0.1:${config.cluster.listen.port}/markStatic?url=${encodeURIComponent(url)}`) : null;
    const htmlId = shortid.generate();
    const htmlPath = path.resolve(app.config.template.dir, `${htmlId}.html`);
    // 写入html文件
    fs.writeFile(htmlPath, pageObj.html, err => {
      console.log(err);
    });

    ctx.attachment(htmlPath);
    ctx.set('Content-Type', 'application/octet-stream');
    ctx.set('Content-Disposition', `attachment;filename=${encodeURI(pageObj.title).toString()}.html`);
    ctx.body = fs.createReadStream(htmlPath);
  }

  public async renderOffLine() {
    const { ctx, service } = this;
    const url = decodeURIComponent(ctx.query.url);
    const pageObj = url ? await service.puppeteerService.offlinePage(url) : null;
    ctx.status = 200;
    ctx.body = pageObj.html;
  }
}
