import { hooks } from 'botframework-webchat-component';
import React, { useCallback } from 'react';

const { useSendPostBack } = hooks;

const PostBackButton = ({ cardAction: { title, value } }) => {
  const sendPostBack = useSendPostBack();
  const handleClick = useCallback(() => sendPostBack(value), [value, sendPostBack]);

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendPostBack" function.
      onClick={handleClick}
      type="button"
    >
      PostBack: {title}
    </button>
  );
};

export default PostBackButton;
