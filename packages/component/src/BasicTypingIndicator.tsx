import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, useMemo } from 'react';

const { useActiveTyping, useRenderTypingIndicator } = hooks;

function isChunkedTyping(activity: WebChatActivity): boolean {
  return activity.type === 'typing' && !!activity.text;
}

function isFromUser({ from: { role } }: WebChatActivity): boolean {
  return role === 'user';
}

function useTypingIndicatorVisible(): readonly [boolean] {
  const [activeTyping] = useActiveTyping();

  return useMemo(
    () =>
      Object.freeze([
        !!Object.values(activeTyping).some(
          // Display typing indicator for non-chunked typing from bot.
          ({ lastTypingActivity }) => !isFromUser(lastTypingActivity) && !isChunkedTyping(lastTypingActivity)
        )
      ]),
    [activeTyping]
  );
}

const BasicTypingIndicator = () => {
  const [activeTyping] = useActiveTyping();
  const [visible] = useTypingIndicatorVisible();
  const [typing] = useActiveTyping(Infinity);
  const renderTypingIndicator = useRenderTypingIndicator();

  return <Fragment>{renderTypingIndicator({ activeTyping, typing, visible })}</Fragment>;
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
