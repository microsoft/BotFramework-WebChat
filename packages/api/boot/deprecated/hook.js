// This is required for Webpack 4 which does not support named exports.
// eslint-disable-next-line no-undef
module.exports = require('../../dist/botframework-webchat-api.hook.js');

console.warn(
  `require('botframework-webchat-api/hook') is deprecated, please use require('botframework-webchat-api/hook.js') instead. This entrypoint will be removed on or after 2028-04-24.`
);
