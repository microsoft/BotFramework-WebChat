/**
 * Checks whether a flipper of a carousel is hidden.
 *
 * The flipper is hidden when its body has slid out of the flipper button: 1 second after scrolling stops, the body slides
 * out in 300 milliseconds.
 *
 * @param {Element} flipper - The flipper button (`.react-film__flipper`).
 * @returns {boolean} `true` if the flipper is hidden, otherwise `false`.
 */
export default function isFlipperHidden(flipper) {
  const bodyRect = flipper.querySelector('.react-film__flipper__body').getBoundingClientRect();
  const buttonRect = flipper.getBoundingClientRect();

  return bodyRect.right <= buttonRect.left || bodyRect.left >= buttonRect.right;
}
