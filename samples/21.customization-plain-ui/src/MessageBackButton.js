import { connectToWebChat } from 'botframework-webchat-component';
import React from 'react';

const MessageBackButton = ({ cardAction, sendMessageBack }) => (
  <button
    // Web Chat does the heavylifting for us by exposing a "sendMessageBack" function.
    // We do need to handle "displayText" manually in our renderer though.
    onClick={() => sendMessageBack(cardAction.value, cardAction.text, cardAction.displayText)}
    type="button"
  >
    MessageBack: {cardAction.title}
  </button>
);

export default connectToWebChat(({ sendMessageBack }) => ({ sendMessageBack }))(MessageBackButton);
