const { relative } = require('path');
const AbortController = require('abort-controller');
const NodeEnvironment = require('jest-environment-node');

const { browserName } = require('../../constants.json');
const hostServe = require('./hostServe');
const serveJSON = require('../../../serve-test.json');

class WebChatEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);

    this.abortController = new AbortController();
    this.relativeTestPath = relative(process.cwd(), context.testPath);
    this.global.docker = browserName === 'chrome-docker';
  }

  async setup() {
    super.setup();

    const { signal } = this.abortController;

    this.global.abortSignal = signal;

    if (!this.global.docker) {
      const { port } = await hostServe(signal, {
        ...serveJSON,
        public: '.'
      });

      this.global.webServerPort = port;
    }
  }

  async teardown() {
    this.abortController.abort();

    await super.teardown();
  }
}

module.exports = WebChatEnvironment;
