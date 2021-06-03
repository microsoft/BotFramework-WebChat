import became from './became';
import scrollToEndButton from '../pageElements/scrollToEndButton';

export default function scrollToEndButtonHidden() {
  return became('Scroll to end button is hidden', () => !scrollToEndButton(), 1000);
}
