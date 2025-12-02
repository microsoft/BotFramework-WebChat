const FOCUSABLE_SELECTOR_QUERY = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

// TODO: Use our own implementation of <FocusTrap>, we have better UX:
//       - Save last focus
//       - When an element become non-focusable
//       However, this implementation is better at:
//       - Handle "inert" attribute
//       - Handle invisible element (element without `offsetParent`)
class FocusTrap extends HTMLElement {
  constructor() {
    super();

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.classList.add('focus-trap');
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.key === 'Tab') {
      const focusables = Array.from(this.querySelectorAll(FOCUSABLE_SELECTOR_QUERY)).filter(
        element => !element.closest('[inert]') && element.offsetParent
      );

      if (!focusables.length) {
        return;
      }

      const [firstElement] = focusables;
      const lastElement = focusables.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        event.stopPropagation();

        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        event.stopPropagation();

        firstElement.focus();
      }
    } else if (event.key === 'Escape') {
      event.stopPropagation();

      this.dispatchEvent(new CustomEvent('escapekeydown', { bubbles: true }));
    }
  }
}

customElements.define('focus-trap', FocusTrap);
