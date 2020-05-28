import getNewMessageButton from '../elements/newMessageButton';

const { Simulate } = window.ReactTestUtils;

export default function clickNewMessageButton() {
  const newMessageButton = getNewMessageButton();

  if (!newMessageButton) {
    throw new Error('Cannot find new message button');
  }

  Simulate.click(newMessageButton);
}
