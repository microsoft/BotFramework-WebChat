import { connectToWebChat } from 'botframework-webchat-component';
import React from 'react';

const PostBackButton = ({ cardAction, sendPostBack }) => (
  <button
    // Web Chat does the heavylifting for us by exposing a "sendPostBack" function.
    onClick={() => sendPostBack(cardAction.value)}
    type="button"
  >
    PostBack: {cardAction.title}
  </button>
);

export default connectToWebChat(({ sendPostBack }) => ({ sendPostBack }))(PostBackButton);
