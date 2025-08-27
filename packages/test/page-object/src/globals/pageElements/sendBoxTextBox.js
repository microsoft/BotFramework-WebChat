import root from './root';

export default function sendBoxTextBox() {
  return root().querySelector(`[data-testid="${window.WebChat.testIds.sendBoxTextBox}"]`);
}
