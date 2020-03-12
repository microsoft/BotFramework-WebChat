import getConnectivityStatus from '../pageObjects/getConnectivityStatus';

export default function connectivityStatusShown(message) {
  return {
    message:
      message instanceof RegExp
        ? `for connectivity status that match ${message}`
        : `for connectivity status "${message}"`,
    fn: async () => {
      const connectivityStatus = getConnectivityStatus();

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
