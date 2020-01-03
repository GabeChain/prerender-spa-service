import { Application } from 'egg';

export default (app: Application) => {
  const { router, controller } = app;
  //URL地址HTML静态化标记proxy
  router.get('/markStatic', controller.static.mark)
  //URL地址静态化
  router.get('/renderStatic', controller.static.render)
  //URL静态化下载
  router.get('/downloadStatic', controller.static.download)
  //URL地址静态化
  router.get('/renderOffLine', controller.static.renderOffLine)
};