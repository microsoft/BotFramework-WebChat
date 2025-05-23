import { testIds } from 'botframework-webchat';

import root from './root';

const CSS_SELECTOR = `[data-testid="${testIds.sendBoxTextBox}"]`;

export default function sendBoxTextBox() {
  return root().querySelector(CSS_SELECTOR);
}

export { CSS_SELECTOR };
