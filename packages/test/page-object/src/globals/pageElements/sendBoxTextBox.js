import root from './root';

const CSS_SELECTOR = '[role="form"] > * > form > input[type="text"], [role="form"] > * > form textarea';

export default function sendBoxTextBox() {
  return root().querySelector(CSS_SELECTOR);
}

export { CSS_SELECTOR };
