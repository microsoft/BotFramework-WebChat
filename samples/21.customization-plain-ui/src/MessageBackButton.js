import { hooks } from 'botframework-webchat-component';
import React, { useCallback } from 'react';

const { useSendMessageBack } = hooks;

const MessageBackButton = ({ cardAction }) => {
  const sendMessageBack = useSendMessageBack();
  const handleClick = useCallback(() => sendMessageBack(cardAction.value, cardAction.text, cardAction.displayText), [
    cardAction,
    sendMessageBack
  ]);

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendMessageBack" function.
      // We do need to handle "displayText" manually in our renderer though.
      onClick={handleClick}
      type="button"
    >
      MessageBack: {cardAction.title}
    </button>
  );
};

export default MessageBackButton;
