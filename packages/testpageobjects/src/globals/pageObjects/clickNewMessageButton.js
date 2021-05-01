import getNewMessageButton from '../pageElements/newMessageButton';

export default function clickNewMessageButton() {
  const newMessageButton = getNewMessageButton();

  if (!newMessageButton) {
    throw new Error('Cannot find new message button');
  }

  return host.click(newMessageButton);
}
