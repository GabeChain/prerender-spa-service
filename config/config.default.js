/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
const path = require('path')

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.cluster = {
    listen: {
      port: 7011,
      hostname: '0.0.0.0',
    }
  }

  config.template = {
    dir: path.join(appInfo.baseDir, 'template'),
  }

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1577782367211_7382';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
