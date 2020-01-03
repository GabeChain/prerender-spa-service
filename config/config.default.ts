import { EggAppInfo, EggAppConfig, PowerPartial } from 'egg';
const path = require('path');

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // 覆盖框架，插件的配置
  config.keys = appInfo.name + '_1577782367211_7382';
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
    },
  };

  // 应用本身的配置
  const bizConfig = {};

  config.cluster = {
    listen: {
      port: 7011,
      // hostname: '0.0.0.0',
    }
  }

  config.template = {
    dir: path.join(appInfo.baseDir, 'template'),
  }

  // 目的是将业务配置属性合并到 EggAppConfig 中返回
  return {
    // 如果直接返回 config ，将该类型合并到 EggAppConfig 的时候可能会出现 circulate type 错误。
    ...config as {},
    ...bizConfig,
  };
};
