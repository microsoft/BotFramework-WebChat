/* global window */

module.exports = webDriver =>
  async function checkAccessibility() {
    const error = await webDriver.executeAsyncScript(callback => {
      try {
        window.checkAccessibility().then(callback, ({ message, stack }) => callback({ message, stack }));
      } catch (error) {
        return callback({ message: error?.message, stack: error?.stack });
      }
    });

    if (error) {
      const errorObject = new Error(error.message);

      errorObject.stack = error.stack;

      throw errorObject;
    }
  };
