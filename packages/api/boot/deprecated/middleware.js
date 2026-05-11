// This is required for Webpack 4 which does not support named exports.
// eslint-disable-next-line no-undef
module.exports = require('../../dist/botframework-webchat-api.middleware.js');

console.warn(
  `require('botframework-webchat-api/middleware') is deprecated, please use require('botframework-webchat-api/middleware.js') instead. This entrypoint will be removed on or after 2028-04-24.`
);
