import getConnectivityStatusElement from '../elements/connectivityStatus';

export default function connectivityStatusShown(message) {
  return {
    message:
      message instanceof RegExp
        ? `for connectivity status that match ${message}`
        : `for connectivity status "${message}"`,
    fn: async () => {
      const connectivityStatus = getConnectivityStatusElement();

      if (!connectivityStatus) {
        return false;
      }

      const targetMessage = connectivityStatus.innerText.trim();

      if (message instanceof RegExp) {
        return message.test(targetMessage);
      }

      return targetMessage === message;
    }
  };
}
