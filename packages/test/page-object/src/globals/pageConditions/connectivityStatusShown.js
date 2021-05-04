import became from './became';
import getConnectivityStatusElement from '../pageElements/connectivityStatus';

export default function connectivityStatusShown(message) {
  return became(
    message instanceof RegExp
      ? `for connectivity status that match ${message}`
      : `for connectivity status "${message}"`,
    () => {
      const connectivityStatus = getConnectivityStatusElement();

      if (!connectivityStatus) {
        return false;
      }

      const targetMessage = connectivityStatus.innerText.trim();

      if (message instanceof RegExp) {
        return message.test(targetMessage);
      }

      return targetMessage === message;
    },
    15000
  );
}
