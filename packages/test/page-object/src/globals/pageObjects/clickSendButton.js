import getSendButton from '../pageElements/sendButton';

export default async function clickSendButton() {
  const sendButton = getSendButton();

  if (!sendButton) {
    throw new Error('Cannot find send button');
  }

  await host.click(sendButton);

  // Move cursor out of the page to remove :hover state from the send button.
  await host.moveTo(document.body.clientWidth, document.body.clientHeight);
}
