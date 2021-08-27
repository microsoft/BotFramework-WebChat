import findAncestor from './findAncestor';

/**
 * Calls `targetElement.scrollIntoView({ block: 'nearest' })`.
 *
 * If browser do not support options for `scrollIntoView`, fallback to polyfill.
 */
export default function scrollIntoViewWithBlockNearest(targetElement: HTMLElement): void {
  // Checks if `scrollIntoView` support options or not.
  // - https://github.com/Modernizr/Modernizr/issues/1568#issuecomment-419457972
  // - https://stackoverflow.com/questions/46919627/is-it-possible-to-test-for-scrollintoview-browser-compatibility
  if ('scrollBehavior' in document.documentElement.style) {
    return targetElement.scrollIntoView({ block: 'nearest' });
  }

  const scrollableElement = findAncestor(targetElement, ancestor => {
    const { overflowY } = window.getComputedStyle(ancestor);

    return overflowY === 'auto' || overflowY === 'scroll';
  });

  if (!scrollableElement) {
    throw new Error('"targetElement" must be contained by a scrollable container.');
  }

  const scrollTopAtTopSide = targetElement.offsetTop;
  const scrollTopAtBottomSide = targetElement.offsetTop + targetElement.offsetHeight;

  const deltaToTop = scrollableElement.scrollTop - scrollTopAtTopSide;
  const deltaToBottom = scrollTopAtBottomSide - scrollableElement.scrollTop - scrollableElement.offsetHeight;

  if (deltaToTop < deltaToBottom) {
    scrollableElement.scrollTop -= deltaToTop;
  } else {
    scrollableElement.scrollTop += deltaToBottom;
  }
}
