import { hooks } from 'botframework-webchat-component';
import React, { useCallback } from 'react';

const { useSendMessageBack } = hooks;

const MessageBackButton = ({ cardAction: { displayText, text, title, value } }) => {
  const sendMessageBack = useSendMessageBack();

  const handleClick = useCallback(() => sendMessageBack(value, text, displayText), [
    displayText,
    sendMessageBack,
    text,
    value
  ]);

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendMessageBack" function.
      // We do need to handle "displayText" manually in our renderer though.
      onClick={handleClick}
      type="button"
    >
      MessageBack: {title}
    </button>
  );
};

export default MessageBackButton;
