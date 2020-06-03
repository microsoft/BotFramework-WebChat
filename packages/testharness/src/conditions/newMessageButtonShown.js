import getNewMessageButton from '../elements/newMessageButton';

export default function newMessageButtonShown() {
  return {
    message: `New message button is shown`,
    fn: () => !!getNewMessageButton()
  };
}
