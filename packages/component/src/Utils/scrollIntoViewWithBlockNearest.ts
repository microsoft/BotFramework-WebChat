import computeScrollIntoView from 'compute-scroll-into-view';

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

  // We should only move transcript scrollable, and not other scrollable, such as document.body which is from the hosting page.
  const [action] = computeScrollIntoView(targetElement, { block: 'nearest' });

  action.el.scrollTop = action.top;
}
