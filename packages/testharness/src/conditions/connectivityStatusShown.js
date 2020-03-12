export default function connectivityStatusShown(message) {
  return {
    message:
      message instanceof RegExp
        ? `for connectivity status that match ${message}`
        : `for connectivity status "${message}"`,
    fn: async driver => {
      const targetMessage = document.querySelector(`.webchat__connectivityStatus`).innerText.trim();

      if (message instanceof RegExp) {
        return message.test(targetMessage);
      }

      return targetMessage === message;
    }
  };
}
