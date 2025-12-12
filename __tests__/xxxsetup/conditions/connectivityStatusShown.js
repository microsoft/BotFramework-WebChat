import { Condition } from 'selenium-webdriver';

export default function connectivityStatusShown(message) {
  const conditionMessage =
    message instanceof RegExp
      ? `for connectivity status that match ${message}`
      : `for connectivity status "${message}"`;

  return new Condition(conditionMessage, async driver => {
    const targetMessage = await driver.executeScript(() =>
      document.querySelector(`.webchat__connectivityStatus`).innerText.trim()
    );

    if (message instanceof RegExp) {
      return message.test(targetMessage);
    }

    return targetMessage === message;
  });
}
