// Navigable event means the end-user is focusing on an inputtable element, but it is okay to capture the arrow keys.
// For example, if the end-user is on <button>, we can capture the arrow keys.
// We can also capture arrow keys when the user is on a <textarea> without contents.
// eslint-disable-next-line complexity
export default function navigableEvent(event) {
  const {
    altKey,
    target,
    target: { tagName }
  } = event;

  const autocompleteAttribute = target.getAttribute('autocomplete');
  const autocomplete = autocompleteAttribute && autocompleteAttribute !== 'off';

  // Generally, we allow up/down arrow keys on all elements captured here, except those handled by the user agent.
  // For example, if it is on <select>, we will ignore up/down arrow keys. Also true for textbox with autocomplete.

  // For some elements, user agent doesn't handle arrow keys when ALT key is held, so we can still handle ALT + UP/DOWN keys.
  // For example, user agent ignores ALT + UP/DOWN on <input type="text"> with content.
  // Counter-example: user agent continues to handle ALT + UP/DOWN on <input type="number">.
  if (tagName === 'INPUT') {
    const { list, type, value } = target;

    // These are buttons, up/down arrow keys are not handled by the user agent.
    if (
      type === 'button' ||
      type === 'checkbox' ||
      type === 'file' ||
      type === 'image' ||
      type === 'radio' ||
      type === 'reset' ||
      type === 'submit'
    ) {
      return true;
    } else if (
      type === 'email' ||
      type === 'password' ||
      type === 'search' ||
      type === 'tel' ||
      type === 'text' ||
      type === 'url'
    ) {
      if (autocomplete || list) {
        // "autocomplete" and "list" are comboboxes. Up/down arrow keys may be handled by the user agent.
        return true;
      } else if (altKey || !value) {
        // If the input has content, user agent will handle up/down arrow and it work similar to HOME/END keys.
        // "altKey" can be used; user agent ignores ALT + UP/DOWN.
        return true;
      }
    }
  } else if (tagName === 'SELECT') {
    // User agent handles up/down arrow keys for dropdown list.
    return false;
  } else if (tagName === 'TEXTAREA') {
    if (!autocomplete && (altKey || !target.value)) {
      // User agent handles up/down arrow keys for multiline text box if it has content or is auto-complete.
      return true;
    }
  } else if (target.getAttribute('contenteditable') === 'true') {
    if (altKey || !target.innerHTML) {
      // "contenteditable" element works like <textarea> minus "autocomplete".
      return true;
    }
  } else {
    return true;
  }
}
