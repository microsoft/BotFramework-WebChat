import { hooks } from 'botframework-webchat';
import React, { memo, useCallback } from 'react';
import type { CardAction } from './CardAction';

const { useSendMessageBack } = hooks;

function MessageBackButton({ cardAction: { displayText, text, title, value } }: Readonly<{ cardAction: CardAction }>) {
  const sendMessageBack = useSendMessageBack();

  const handleClick = useCallback(
    () => sendMessageBack(value, text, displayText),
    [displayText, sendMessageBack, text, value]
  );

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendMessageBack" function.
      // We do need to handle "displayText" manually in our renderer though.
      onClick={handleClick}
      type="button"
      // eslint-disable-next-line react/jsx-no-literals
    >
      MessageBack: {title}
    </button>
  );
}

export default memo(MessageBackButton);
