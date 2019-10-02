const {
  navigator: { userAgent }
} = window;

const IE_FOCUSABLE_LIST = [
  'a',
  'body',
  'button',
  'frame',
  'iframe',
  'img',
  'input',
  'isindex',
  'object',
  'select',
  'textarea'
];

const IS_FIREFOX = /Firefox\//iu.test(userAgent);
const IS_IE = /Trident\//iu.test(userAgent);

export default function getTabIndex(element) {
  const { tabIndex } = element;

  if (IS_IE) {
    const tabIndexAttribute = element.attributes.getNamedItem('tabindex');

    if (!tabIndexAttribute || !tabIndexAttribute.specified) {
      return ~IE_FOCUSABLE_LIST.indexOf(element.nodeName.toLowerCase()) ? 0 : null;
    }
  } else if (!~tabIndex) {
    const attr = element.getAttribute('tabindex');

    if (attr === null || (attr === '' && !IS_FIREFOX)) {
      return null;
    }
  }

  return tabIndex;
}
