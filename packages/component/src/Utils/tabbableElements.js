export default function tabbableElements(element) {
  // This is an incomplete list, due to the complexity of testing for every scenario.
  // For full-list, please refer to https://allyjs.io/data-tables/focusable.html
  const candidates = element.querySelectorAll(
    'a[href], area[href], audio[controls], button:not(:disabled), iframe, input:not(:disabled), keygen, select:not(:disabled), summary, textarea:not(:disabled), video[controls], [contenteditable], [tabindex]'
  );

  return [].filter.call(candidates, element => {
    const tabIndexAttribute = element.attributes.getNamedItem('tabindex');

    if (tabIndexAttribute && tabIndexAttribute.specified) {
      const value = parseInt(tabIndexAttribute.value, 10);

      return value >= 0 || (isNaN(value) && element.nodeName.toLowerCase() === 'input');
    }

    return true;
  });
}
