import getToastElements from '../elements/toasts';

export default function toastShown(message) {
  const conditionMessage =
    typeof message === 'number'
      ? `for number of toasts equals to ${message}`
      : !message
      ? 'for any toast to show'
      : message instanceof RegExp
      ? `for toast that match ${message}`
      : `for toast "${message}"`;

  return {
    message: conditionMessage,
    fn: () => {
      const targetMessages = [].map.call(getToastElements(), ({ innerText }) => innerText.trim());

      if (typeof message === 'number') {
        return targetMessages.length === message;
      } else if (!message) {
        return targetMessages.length;
      } else if (message instanceof RegExp) {
        return targetMessages.some(targetMessage => message.test(targetMessage));
      }

      return !!~targetMessages.indexOf(message);
    }
  };
}
