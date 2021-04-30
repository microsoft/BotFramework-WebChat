const CSS_SELECTOR = '[role="form"] > * > form > input[type="text"]';

export default function sendBoxTextBox() {
  return document.querySelector(CSS_SELECTOR);
}

export { CSS_SELECTOR };
