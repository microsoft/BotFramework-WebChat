import became from './became';
import typingIndicator from '../pageElements/typingIndicator';

export default function typingIndicatorHidden() {
  return became('typing indicator is hidden', () => !typingIndicator(), 5000);
}
