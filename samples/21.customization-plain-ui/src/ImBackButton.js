import { hooks } from 'botframework-webchat-component';
import React, { useCallback } from 'react';

const { useSendMessage } = hooks;

const ImBackButton = ({ cardAction }) => {
  const sendMessage = useSendMessage();
  const handleClick = useCallback(() => sendMessage(cardAction.value), [cardAction, sendMessage]);

  return (
    <button
      // ImBack is essentially sending a message
      onClick={handleClick}
      type="button"
    >
      ImBack: {cardAction.title}
    </button>
  );
};

export default ImBackButton;
