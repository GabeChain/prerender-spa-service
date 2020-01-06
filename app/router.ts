import { Application } from 'egg';

export default (app: Application) => {
  const { router, controller } = app;
  //URL地址HTML静态化标记proxy
  router.get('/markStatic', controller.static.mark)
  //URL地址预渲染服务
  router.get('/renderStatic', controller.static.render)
  //URL预渲染化html下载
  router.get('/downloadStatic', controller.static.download)
  //URL离线html渲染
  router.get('/renderOffLine', controller.static.renderOffLine)
};