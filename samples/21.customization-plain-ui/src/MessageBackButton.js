import { hooks } from 'botframework-webchat-component';
import React from 'react';

const { useSendMessageBack } = hooks;

const MessageBackButton = ({ cardAction }) => {
  const sendMessageBack = useSendMessageBack();

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendMessageBack" function.
      // We do need to handle "displayText" manually in our renderer though.
      onClick={() => sendMessageBack(cardAction.value, cardAction.text, cardAction.displayText)}
      type="button"
    >
      MessageBack: {cardAction.title}
    </button>
  );
};

export default MessageBackButton;
