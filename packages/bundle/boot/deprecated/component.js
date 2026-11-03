// This is required for Webpack 4 which does not support named exports.
// eslint-disable-next-line no-undef
module.exports = require('../../dist/botframework-webchat.component.js');

console.warn(
  `require('botframework-webchat/component') is deprecated, please use require('botframework-webchat/component.js') instead. This entrypoint will be removed on or after 2028-04-24.`
);
