import getActionHistory from '../pageObjects/internal/getActionHistory';

export default function webChatRendered() {
  return {
    message: 'Web Chat is rendered',
    fn: () => getActionHistory().length
  };
}
