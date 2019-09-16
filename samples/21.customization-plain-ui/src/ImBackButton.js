import { connectToWebChat } from 'botframework-webchat-component';
import React from 'react';

const ImBackButton = ({ cardAction, sendMessage }) => (
  <button
    // ImBack is essentially sending a message
    onClick={() => sendMessage(cardAction.value)}
    type="button"
  >
    ImBack: {cardAction.title}
  </button>
);

export default connectToWebChat(({ sendMessage }) => ({ sendMessage }))(ImBackButton);
