'use strict';

const Service = require('egg').Service;
const mhtml2html = require('mhtml2html');
const { JSDOM } = require('jsdom');

class puppeteerService extends Service {
  async markHtml(url) {
    return await JSDOM.fromURL(url).then(dom => {
      const window = dom.window;
      const { document } = window;
      // 修改资源base路径
      const headBase = document.createElement('base');
      headBase.setAttribute('href', window.location.origin);
      document.querySelector('head').insertBefore(headBase, document.querySelector('head').firstChild);
      // 添加静态化标记
      document.querySelector('html').dataset.render = 'static';
      [].forEach.call(document.querySelector('head').childNodes, node => {
        if (node.nodeType === 1) {
          node.dataset.render = 'static';
        }
      });
      [].forEach.call(document.querySelector('body').childNodes, node => {
        if (node.nodeType === 1) {
          node.dataset.render = 'static';
          [].forEach.call(node.childNodes, node => {
            if (node.nodeType === 1) {
              node.dataset.render = 'static';
            }
          });
        }
      });
      // vue-cli挂载的dom添加Vue.JS会识别的静态化渲染标记
      // document.querySelector('#app') ? document.querySelector('#app').setAttribute('data-server-rendered', 'true') : null

      return { html: dom.serialize() };
    }).catch(err => {
      console.log(err);
      return { html: 'url地址访问失败' };
    });
  }

  async renderPage(url) {
    const { app } = this;

    // 取出app初始化puppeteer实例使用
    const page = await app.pool.use(async instance => {
      return await instance.newPage();
    });

    // 1. 监听网络请求
    await page.setRequestInterception(true);
    page.on('request', req => {
      // 2. 忽略不必要的请求，如图片，视频样式等等
      const whitelist = [ 'document', 'script', 'xhr', 'fetch' ];
      if (!whitelist.includes(req.resourceType())) {
        return req.abort();
      }
      // 3. 其它请求正常继续
      req.continue();
    });
    await page.goto(url);

    // 阻断页面进入后跳转
    // await page.evaluate(() => {
    //   window.onbeforeunload = function(e) {
    //     console.log('onbeforeunload');
    //     return 'stop navigating';
    //   }
    //   history.pushState(null, null, document.URL)
    //   window.addEventListener('popstate', () => {
    //     console.log('popstate')
    //     history.pushState(null, null, document.URL);
    //   });
    // })
    // await page.on('dialog', dialog => {
    //   dialog.dismiss();
    // });
    await page.waitFor(500, { waitUntil: 'load' });

    // 通过动态行为标记剔除标签、dom
    await page.evaluate(() => {
      if (!document.querySelector('html').dataset.render) { return; }
      // 删除动态添加的一级标签
      for (let i = 0; i < document.querySelector('head').childNodes.length; i++) {
        const node = document.querySelector('head').childNodes[i];
        if (node.nodeType === 1 && node.dataset.render !== 'static') {
          node.remove();
          i--;
        }
      }
      for (let i = 0; i < document.querySelector('body').childNodes.length; i++) {
        const node = document.querySelector('body').childNodes[i];
        if (node.nodeType === 1 && node.dataset.render !== 'static' && node.nodeName !== 'STYLE') {
          node.remove();
          i--;
        }
      }
      // 为JS动态渲染的二级dom添加标记
      [].forEach.call(document.querySelector('body').childNodes, node => {
        if (node.nodeType === 1) {
          // vue.js ssr渲染标记 全不放过
          node.setAttribute('data-server-rendered', 'true');

          node.dataset.render !== 'static' ? node.dataset.render = 'hydration' : null;
          [].forEach.call(node.childNodes, node => {
            if (node.nodeType === 1) {
              node.dataset.render !== 'static' ? node.dataset.render = 'hydration' : null;
            }
          });
        }
      });
      // 添加脚本 data-render="hydration"的是js动态渲染的，js执行完成后避免重复，将其删掉
      const rmReHydScript = document.createElement('SCRIPT');
      rmReHydScript.dataset.render = 'hydration';
      rmReHydScript.text = `
        if (!/HeadlessChrome/.test(window.navigator.userAgent)) {
          document.addEventListener('DOMContentLoaded', function() {
            
            for (let i = 0; i < document.querySelector('body').childNodes.length; i++) {
              let node = document.querySelector('body').childNodes[i]
              if (node.nodeType === 1 && node.dataset.render === 'hydration') {
                node.remove()
                i--
              } else if (node.nodeType === 1) {
                for (let i = 0; i < node.childNodes.length; i++) {
                  let nodeChild = node.childNodes[i]
                  if (nodeChild.nodeType === 1 && nodeChild.dataset.render === 'hydration') {
                    nodeChild.remove()
                    i--
                  }
                }
              }
            }

          });
        }
      `;
      document.querySelector('body').appendChild(rmReHydScript);

    });
    const html = await page.content();
    const title = await page.title();

    return {
      title,
      html,
    };
  }

  async offlinePage(url) {
    const { app } = this;

    // 取出app初始化puppeteer实例使用
    const page = await app.pool.use(async instance => {
      return await instance.newPage();
    });

    await page.goto(url);
    await page.waitForFunction('window.innerHeight > 100');
    await page.waitFor(500, { waitUntil: 'load' });

    const session = await page.target().createCDPSession();
    await session.send('Page.enable');
    const { data } = await session.send('Page.captureSnapshot');

    const title = await page.title();
    const html = mhtml2html.convert(data, html => new JSDOM(html)).serialize();
    return {
      title,
      html,
    };
  }
}

module.exports = puppeteerService;
