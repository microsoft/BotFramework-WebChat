/**
 * Checks whether a flipper of a carousel has slid in completely: its body is centered in the flipper button.
 *
 * A flipper slides in within 300 milliseconds, when the pointer is over the carousel, the carousel is scrolling, or the
 * flipper has focus.
 *
 * @param {Element} flipper - The flipper button (`.carousel-flipper`).
 * @returns {boolean} `true` if the flipper has slid in completely, otherwise `false`.
 */
export default function isFlipperShown(flipper) {
  const bodyRect = flipper.querySelector('.carousel-flipper__body').getBoundingClientRect();
  const buttonRect = flipper.getBoundingClientRect();

  return Math.abs(bodyRect.left + bodyRect.right - buttonRect.left - buttonRect.right) < 1;
}
