import root from './root';

export default function typingIndicator() {
  return root().querySelector(`[data-testid="${window.WebChat.testIds.typingIndicator}"]`);
}
