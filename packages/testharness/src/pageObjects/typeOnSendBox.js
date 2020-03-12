import getSendBoxTextBox from './getSendBoxTextBox';
import sleep from '../utils/sleep';

const { Simulate } = window.ReactTestUtils;

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

export default async function typeOnSendBox(...args) {
  const textBox = getSendBoxTextBox();

  await sendKeys(textBox, ...args);
}
