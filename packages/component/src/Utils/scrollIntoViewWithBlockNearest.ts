/**
 * Calls `targetElement.scrollIntoView({ block: 'nearest' })`.
 *
 * If browser do not support options for `scrollIntoView`, fallback to polyfill.
 */
export default function scrollIntoViewWithBlockNearest(
  targetElement: HTMLElement,
  scrollableElement: HTMLElement
): void {
  // Checks if `scrollIntoView` support options or not.
  // - https://github.com/Modernizr/Modernizr/issues/1568#issuecomment-419457972
  // - https://stackoverflow.com/questions/46919627/is-it-possible-to-test-for-scrollintoview-browser-compatibility
  if ('scrollBehavior' in document.documentElement.style) {
    return targetElement.scrollIntoView({ block: 'nearest' });
  }

  // This is for browser that does not support options passed to scrollIntoView(), possibly IE11.
  // IE11 does not support computedStyleMap(), thus, the scrollableElement must be specified.

  if (!scrollableElement.contains(targetElement)) {
    throw new Error('scrollableElement must be an ancestor of targetElement.');
  }

  const scrollTopAtTopSide = targetElement.offsetTop;
  const scrollTopAtBottomSide = targetElement.offsetTop + targetElement.offsetHeight;

  if (scrollTopAtTopSide < scrollableElement.scrollTop) {
    scrollableElement.scrollTop = scrollTopAtTopSide;
  } else if (scrollTopAtBottomSide > scrollableElement.scrollTop + scrollableElement.offsetHeight) {
    scrollableElement.scrollTop = scrollTopAtBottomSide - scrollableElement.offsetHeight;
  }
}
