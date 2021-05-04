import getSendButton from '../pageElements/sendButton';

export default function clickSendButton() {
  const sendButton = getSendButton();

  if (!sendButton) {
    throw new Error('Cannot find send button');
  }

  return host.click(sendButton);
}
