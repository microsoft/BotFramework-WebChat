import getSendButton from '../elements/sendButton';

const { Simulate } = window.ReactTestUtils;

export default function clickSendButton() {
  const sendButton = getSendButton();

  if (!sendButton) {
    throw new Error('Cannot find send button');
  }

  Simulate.click(sendButton);
}
