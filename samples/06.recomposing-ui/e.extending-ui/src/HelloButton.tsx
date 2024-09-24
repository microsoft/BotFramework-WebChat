import { hooks } from 'botframework-webchat-component';
import React, { memo, useCallback } from 'react';

const { useSendMessage } = hooks;

function HelloButton() {
  const sendMessage = useSendMessage();

  const handleClick = useCallback(() => sendMessage('Hello!'), [sendMessage]);

  return (
    // eslint-disable-next-line react/jsx-no-literals
    <button onClick={handleClick} type="button">
      Say Hello!
    </button>
  );
}

export default memo(HelloButton);
