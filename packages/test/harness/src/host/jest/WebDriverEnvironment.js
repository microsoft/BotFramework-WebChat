require('global-agent/bootstrap');

const { join } = require('path');
const { TestEnvironment } = require('jest-environment-node');

class WebDriverEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);

    config.projectConfig.setupFilesAfterEnv.push(join(__dirname, 'runHTML.js'));
  }
}

module.exports = WebDriverEnvironment;
