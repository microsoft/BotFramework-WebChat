import became from './became';
import scrollToEndButton from '../pageElements/scrollToEndButton';

export default function scrollToEndButtonShown() {
  return became('Scroll to end button is shown', () => !!scrollToEndButton(), 1000);
}
