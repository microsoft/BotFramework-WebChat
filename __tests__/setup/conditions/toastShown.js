import { Condition } from 'selenium-webdriver';

export default function toastShown(message) {
  const conditionMessage =
    typeof message === 'number'
      ? `for number of toasts equals to ${message}`
      : !message
      ? 'for any toast to show'
      : message instanceof RegExp
      ? `for toast that match ${message}`
      : `for toast "${message}"`;

  return new Condition(conditionMessage, async driver => {
    const targetMessages = await driver.executeScript(() =>
      [].map.call(document.querySelectorAll(`.webchat__toaster__listItem`), ({ innerText }) => innerText.trim())
    );

    if (typeof message === 'number') {
      return targetMessages.length === message;
    } else if (!message) {
      return targetMessages.length;
    } else if (message instanceof RegExp) {
      return targetMessages.some(targetMessage => message.test(targetMessage));
    }

    return !!~targetMessages.indexOf(message);
  });
}
