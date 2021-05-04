import became from './became';
import getNewMessageButton from '../pageElements/newMessageButton';

export default function newMessageButtonHidden() {
  return became('New message button is hidden', () => !getNewMessageButton(), 1000);
}
