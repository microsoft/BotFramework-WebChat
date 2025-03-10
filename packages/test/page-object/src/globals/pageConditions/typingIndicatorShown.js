import became from './became';
import typingIndicator from '../pageElements/typingIndicator';

export default function typingIndicatorShown() {
  return became('typing indicator is shown', () => typingIndicator(), 5000);
}
