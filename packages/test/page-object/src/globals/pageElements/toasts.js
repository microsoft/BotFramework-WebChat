import root from './root';

export default function toasts() {
  return root().querySelectorAll(`.webchat__toaster__listItem`);
}
