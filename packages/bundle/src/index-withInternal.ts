/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

import { useInjectStyles } from 'botframework-webchat-component/internal/useInjectStyles';
import './index';

export { useInjectStyles };

window['WebChat'] = {
  ...window['WebChat'],
  internal: { useInjectStyles }
};
