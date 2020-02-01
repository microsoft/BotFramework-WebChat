import { Condition } from 'selenium-webdriver';

export default function notificationShown(message) {
  const conditionMessage =
    typeof message === 'number'
      ? `for number of notifications equals to ${message}`
      : !message
      ? 'for any notification to show'
      : message instanceof RegExp
      ? `for notification that match ${message}`
      : `for notification "${message}"`;

  return new Condition(conditionMessage, async driver => {
    const targetMessages = await driver.executeScript(() =>
      [].map.call(document.querySelectorAll(`.webchat__notifications ul > li`), ({ innerText }) => innerText.trim())
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
