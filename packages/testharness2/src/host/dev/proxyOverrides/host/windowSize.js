module.exports = function (webDriver) {
  return async (width, height, element) => {
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
};
