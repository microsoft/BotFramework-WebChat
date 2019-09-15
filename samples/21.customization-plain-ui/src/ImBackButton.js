import { hooks } from 'botframework-webchat-component';
import React from 'react';

const { useSendMessage } = hooks;

const ImBackButton = ({ cardAction }) => {
  const sendMessage = useSendMessage();

  return (
    <button
      // ImBack is essentially sending a message
      onClick={() => sendMessage(cardAction.value)}
      type="button"
    >
      ImBack: {cardAction.title}
    </button>
  );
};

export default ImBackButton;
