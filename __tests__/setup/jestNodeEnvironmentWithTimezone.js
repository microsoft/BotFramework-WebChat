// Adopted from https://stackoverflow.com/questions/56261381/how-do-i-set-a-timezone-in-my-jest-config.
const { TestEnvironment } = require('jest-environment-node');

/**
 * Timezone-aware Jest environment. Supports `@timezone` JSDoc
 * pragma within test suites to set timezone.
 */
module.exports = class TimezoneAwareNodeEnvironment extends TestEnvironment {
  constructor(config, context) {
    // Allow test suites to change timezone, even if TZ is passed in a script.
    // Falls back to existing TZ environment variable or UTC if no timezone is specified.
    // IMPORTANT: This must happen before super(config) is called, otherwise
    // it doesn't work.
    process.env.TZ = context.docblockPragmas.timezone || process.env.TZ || 'UTC';

    super(config);
  }
};
