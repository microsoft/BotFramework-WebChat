/* eslint-env node */

const { default: HappyDOMEnvironment } = require('@happy-dom/jest-environment');

/**
 * happy-dom with the `@timezone` JSDoc pragma, as `JestNodeEnvironmentWithTimeZone.js` does for Node. The time zone of
 * the worker is restored on teardown, so it does not leak to the next test suite run by the same worker.
 */
module.exports = class HappyDOMEnvironmentWithTimeZone extends HappyDOMEnvironment {
  constructor(config, context) {
    // Before `super()`, as in `JestNodeEnvironmentWithTimeZone.js`.
    const { TZ } = process.env;

    process.env.TZ = context.docblockPragmas.timezone || TZ || 'UTC';

    super(config, context);

    this.originalTimeZone = TZ;
  }

  async teardown() {
    await super.teardown();

    // Assigning `undefined` would set the string "undefined".
    if (typeof this.originalTimeZone === 'undefined') {
      delete process.env.TZ;
    } else {
      process.env.TZ = this.originalTimeZone;
    }
  }
};
