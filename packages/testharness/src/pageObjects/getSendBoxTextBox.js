const CSS_SELECTOR = '[role="form"] > * > form > input[type="text"]';

export default function getSendBoxTextBox() {
  return document.querySelector(CSS_SELECTOR);
}

export { CSS_SELECTOR };
