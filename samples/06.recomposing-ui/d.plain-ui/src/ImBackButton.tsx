import { hooks } from 'botframework-webchat';
import React, { useCallback } from 'react';
import type { CardAction } from './CardAction';

const { useSendMessage } = hooks;

function ImBackButton({ cardAction: { title, value } }: Readonly<{ cardAction: CardAction }>) {
  const sendMessage = useSendMessage();
  const handleClick = useCallback(() => sendMessage(value), [value, sendMessage]);

  return (
    <button
      // ImBack is essentially sending a message
      onClick={handleClick}
      type="button"
      // eslint-disable-next-line react/jsx-no-literals
    >
      ImBack: {title}
    </button>
  );
}

export default ImBackButton;
