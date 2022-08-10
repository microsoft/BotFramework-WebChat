import getTabIndex from './TypeFocusSink/getTabIndex';

const ALWAYS_TRUE_FN = () => true;

const SELECTOR =
  'a[href], audio, button, details, details summary, embed, iframe, input, object, rect, select, svg[focusable], textarea, video, [tabindex]';

export default function firstTabbableDescendant(element, filter = ALWAYS_TRUE_FN) {
  if (!element) {
    return;
  }

  // This is best-effort for finding a tabbable element.
  // For a comprehensive list, please refer to https://allyjs.io/data-tables/focusable.html and update this list accordingly.
  const focusables = [].filter.call(element.querySelectorAll(SELECTOR), filter);

  return [].find.call(focusables, focusable => {
    const tabIndex = getTabIndex(focusable);

    return typeof tabIndex === 'number' && tabIndex >= 0;
  });
}

function orSelf(element) {
  if (!element) {
    return;
  }

  // "msMatchesSelector" is vendor-prefixed version of "matches".
  // eslint-disable-next-line dot-notation
  if ((element.matches || element['msMatchesSelector']).call(element, SELECTOR)) {
    return element;
  }

  return firstTabbableDescendant(element);
}

export { orSelf };
