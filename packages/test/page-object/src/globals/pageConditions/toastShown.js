import getToastElements from '../pageElements/toasts';
import getToasterHeader from '../pageElements/toasterHeader';
import became from './became';

export default function toastShown(message) {
  const conditionMessage =
    typeof message === 'number'
      ? `for number of visible toasts equals to ${message}`
      : !message
      ? 'for any toast to show'
      : message instanceof RegExp
      ? `for toast that match ${message}`
      : `for toast "${message}"`;

  return became(
    conditionMessage,
    () => {
      const targetMessages = [].map.call(getToastElements(), ({ innerText }) => innerText.trim());

      if (typeof message === 'number') {
        if (message === 0) {
          return !targetMessages.length && !getToasterHeader();
        }

        return targetMessages.length === message;
      } else if (!message) {
        // For any number of toasts to show, it can be collapsed (toaster header), or singular (only one toast is shown).
        return targetMessages.length || getToasterHeader();
      } else if (message instanceof RegExp) {
        return targetMessages.some(targetMessage => message.test(targetMessage));
      }

      return !!~targetMessages.indexOf(message);
    },
    1000
  );
}
