/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

import * as internal from 'botframework-webchat-component/internal';
import './index';

export * from 'botframework-webchat-component/internal';

window['WebChat'] = {
  ...window['WebChat'],
  internal
};
