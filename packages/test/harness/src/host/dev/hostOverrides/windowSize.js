module.exports = webDriver =>
  async function windowSize(width, height, element) {
    /* istanbul ignore next */
    element &&
      (await webDriver.executeScript(
        (element, width, height) => {
          if (width) {
            element.style.width = width + 'px';
          }

          if (height) {
            element.style.height = height + 'px';
          }
        },
        element,
        width,
        height
      ));
  };
