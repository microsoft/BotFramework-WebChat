const until = require('./until');

const TIME_FOR_ALL_IMAGES_COMPLETED = 5000; // Time (in ms) to wait for all images to be loaded/errored.

// Wait until all images are loaded/errored, including images inside open shadow roots.
module.exports = async function allImagesCompleted(webDriver) {
  const done = await until(
    () =>
      webDriver.executeScript(() => {
        const isComplete = root =>
          [].every.call(root.querySelectorAll('img'), ({ complete }) => complete) &&
          [].every.call(root.querySelectorAll('*'), ({ shadowRoot }) => !shadowRoot || isComplete(shadowRoot));

        // This code is running in browser VM where "document" is available.
        // eslint-disable-next-line no-undef
        return isComplete(document);
      }),
    TIME_FOR_ALL_IMAGES_COMPLETED
  );

  if (!done) {
    throw new Error(`All images are not completed after ${TIME_FOR_ALL_IMAGES_COMPLETED} ms.`);
  }
};
