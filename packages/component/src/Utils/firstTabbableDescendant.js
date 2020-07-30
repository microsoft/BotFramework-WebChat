import getTabIndex from './TypeFocusSink/getTabIndex';

const SELECTOR =
  'a[href], audio, button, details, details summary, embed, iframe, input, object, rect, select, svg[focusable], textarea, video, [tabindex]';

export default function firstTabbableDescendant(element) {
  if (!element) {
    return;
  }

  // This is best-effort for finding a tabbable element.
  // For a comprehensive list, please refer to https://allyjs.io/data-tables/focusable.html and update this list accordingly.
  const focusables = element.querySelectorAll(SELECTOR);

  return [].find.call(focusables, focusable => {
    const tabIndex = getTabIndex(focusable);

    return typeof tabIndex === 'number' && tabIndex >= 0;
  });
}

function isTabbable(element) {
  if (!element) {
    return;
  }

  return element.matches(SELECTOR);
}

export { isTabbable };
