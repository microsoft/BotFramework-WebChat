import { hooks } from 'botframework-webchat';
import React, { memo, useCallback } from 'react';
import type { CardAction } from './CardAction';

const { useSendPostBack } = hooks;

function PostBackButton({ cardAction: { title, value } }: Readonly<{ cardAction: CardAction }>) {
  const sendPostBack = useSendPostBack();
  const handleClick = useCallback(() => sendPostBack(value), [value, sendPostBack]);

  return (
    <button
      // Web Chat does the heavylifting for us by exposing a "sendPostBack" function.
      onClick={handleClick}
      type="button"
      // eslint-disable-next-line react/jsx-no-literals
    >
      PostBack: {title}
    </button>
  );
}

export default memo(PostBackButton);
