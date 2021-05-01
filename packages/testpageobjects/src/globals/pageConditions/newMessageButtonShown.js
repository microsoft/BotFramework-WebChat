import became from './became';
import getNewMessageButton from '../pageElements/newMessageButton';

export default function newMessageButtonShown() {
  return became('New message button is shown', () => !!getNewMessageButton(), 1000);
}
