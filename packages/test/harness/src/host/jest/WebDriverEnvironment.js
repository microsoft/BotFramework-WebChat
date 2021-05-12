require('global-agent/bootstrap');

const { join } = require('path');
const NodeEnvironment = require('jest-environment-node');

class WebDriverEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);

    config.setupFilesAfterEnv.push(join(__dirname, 'runHTML.js'));
  }
}

module.exports = WebDriverEnvironment;
