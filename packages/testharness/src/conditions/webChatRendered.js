import { getActionHistory } from '../utils/createStore';

export default function webChatRendered() {
  return {
    message: 'Web Chat is rendered',
    fn: () => getActionHistory().length
  };
}
