import typingIndicator from '../elements/typingIndicator';

export default function typingIndicatorShown() {
  return {
    message: 'typing indicator is shown',
    fn: () => typingIndicator()
  };
}
