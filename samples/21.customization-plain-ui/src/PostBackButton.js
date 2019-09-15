import { hooks } from 'botframework-webchat-component';
import React from 'react';

const { useSendPostBack } = hooks;

const PostBackButton = ({ cardAction }) => {
  const sendPostBack = useSendPostBack();

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendPostBack" function.
      onClick={() => sendPostBack(cardAction.value)}
      type="button"
    >
      PostBack: {cardAction.title}
    </button>
  );
};

export default PostBackButton;
