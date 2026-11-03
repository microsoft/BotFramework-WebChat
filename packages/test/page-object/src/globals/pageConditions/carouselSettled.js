import became from './became';
import isFlipperHidden from '../testHelpers/isFlipperHidden';

/**
 * Waits until a carousel has settled: it stopped scrolling and all its flippers are hidden.
 *
 * Snapshots taken before the flippers are hidden may catch them in the middle of their slide.
 *
 * @param {Element} carouselLayout - The carousel (`.carousel-layout`).
 * @returns {Promise<void>}
 */
export default function carouselSettled(carouselLayout) {
  return became(
    'carousel stopped scrolling and all flippers are hidden',
    () =>
      !carouselLayout.querySelector('.react-film__main--scrolling') &&
      Array.from(carouselLayout.querySelectorAll('.react-film__flipper')).every(isFlipperHidden),
    5000
  );
}
