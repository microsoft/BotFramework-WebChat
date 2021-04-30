import became from './became';
import getActionHistory from '../pageObjects/internal/getActionHistory';

export default function webChatRendered() {
  return became('Web Chat is rendered', () => getActionHistory().length, 1000);
}
