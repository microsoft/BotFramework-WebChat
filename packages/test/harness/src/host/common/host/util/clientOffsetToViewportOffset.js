function isZeroOrPositive(value) {
  // This will handle minus-zero.
  return 1 / value >= 0;
}

/**
 * Calculates the page offset of the upper-left corner of the element.
 *
 * @param {number} x - Pixels to offset from the left of the element. If the value is negative, will offset from the right.
 * @param {number} y - Pixels to offset from the top of the element. If the value is negative, will offset from the bottom.
 * @param {HTMLElement} element - Element to calculate the page offset.
 *
 * @return {({ x: number, y: number })} The page offset of the upper-left corner of the element.
 */
module.exports = async function clientOffsetToViewportOffset(webDriver, element, x, y) {
  if (element) {
    const { offsetHeight, offsetWidth, pageX, pageY } = await webDriver.executeScript(element => {
      const { offsetHeight, offsetWidth } = element;
      // We cannot destructure the array as Babel would translate it using Babel helpers.
      // This code is running under a VM and helpers are not available.
      // eslint-disable-next-line prefer-destructuring
      const { x: pageX, y: pageY } = element.getClientRects()[0];

      return { offsetHeight, offsetWidth, pageX, pageY };
    }, element);

    if (!isZeroOrPositive(x)) {
      x += offsetWidth;
    }

    if (!isZeroOrPositive(y)) {
      y += offsetHeight;
    }

    x += pageX;
    y += pageY;
  }

  return { x, y };
};
