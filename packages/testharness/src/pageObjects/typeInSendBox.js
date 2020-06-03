import getSendBoxTextBoxElement from '../elements/sendBoxTextBox';
import sleep from '../utils/sleep';

const { Simulate } = window.ReactTestUtils;
const globalSetTimeout = setTimeout;

function sendKey(element, char) {
  if (char === '\n') {
    Simulate.submit(element);
  } else {
    element.value += char;
    Simulate.change(element);
  }
}

async function sendKeys(element, ...args) {
  const keys = args.reduce((keys, arg) => {
    if (typeof arg === 'string') {
      keys.push(...arg.split(''));
    }

    return keys;
  }, []);

  while (keys.length) {
    sendKey(element, keys.shift());
    await sleep(30);
  }
}

export default async function typeInSendBox(...args) {
  const textBox = getSendBoxTextBoxElement();

  textBox.focus();
  Simulate.focus(textBox);

  await new Promise(resolve => globalSetTimeout(resolve, 1000));

  await sendKeys(textBox, ...args);
}
