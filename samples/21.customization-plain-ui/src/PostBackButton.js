import { hooks } from 'botframework-webchat-component';
import React, { useCallback } from 'react';

const { useSendPostBack } = hooks;

const PostBackButton = ({ cardAction }) => {
  const sendPostBack = useSendPostBack();
  const handleClick = useCallback(() => sendPostBack(cardAction.value), [cardAction, sendPostBack]);

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendPostBack" function.
      onClick={handleClick}
      type="button"
    >
      PostBack: {cardAction.title}
    </button>
  );
};

export default PostBackButton;
