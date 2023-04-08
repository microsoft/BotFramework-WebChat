/* global window */

module.exports = webDriver =>
  async function checkAccessibility() {
    const errorMessage = await webDriver.executeAsyncScript(callback => {
      try {
        window.checkAccessibility().then(callback, ({ message }) => callback(message));
      } catch (error) {
        return callback(error?.message);
      }
    });

    if (errorMessage) {
      throw new Error(errorMessage);
    }
  };
