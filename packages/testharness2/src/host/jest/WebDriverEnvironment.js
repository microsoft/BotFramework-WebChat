const NodeEnvironment = require('jest-environment-node');

class WebDriverEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async teardown() {
    // We must stop the bridge too, otherwise, it will cause timeout.
    this.global.webDriverBridge && this.global.webDriverBridge.close();

    this.global.__operation__ && console.log(`Last operation was ${this.global.__operation__}`);

    // Exceptions thrown in setup() will still trigger teardown(), such as, global.webDriver is not properly set up.
    this.global.webDriver && (await this.global.webDriver.terminate());

    await super.teardown();
  }
}

module.exports = WebDriverEnvironment;
