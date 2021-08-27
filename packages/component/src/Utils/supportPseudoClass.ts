// This function is adopted from https://stackoverflow.com/questions/8531940/how-to-detect-if-browser-support-specified-css-pseudo-class
export default function supportPseudoClass(pseudoClass: string, nonce?: string): boolean {
  const styleElement = document.createElement('style');

  nonce && styleElement.setAttribute('nonce', nonce);
  document.head.appendChild(styleElement);

  try {
    styleElement.sheet.insertRule('html' + pseudoClass + '{}', 0);

    return true;
  } catch (error) {
    return false;
  } finally {
    document.head.removeChild(styleElement);
  }
}
