import { hooks } from 'botframework-webchat-component';
import React, { useCallback } from 'react';

const { useSendMessage } = hooks;

const ImBackButton = ({ cardAction: { title, value } }) => {
  const sendMessage = useSendMessage();
  const handleClick = useCallback(() => sendMessage(value), [value, sendMessage]);

  return (
    <button
      // ImBack is essentially sending a message
      onClick={handleClick}
      type="button"
    >
      ImBack: {title}
    </button>
  );
};

export default ImBackButton;
