import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, useMemo } from 'react';

const { useActiveTyping, useRenderTypingIndicator } = hooks;

function isTypingLivestream(activity: WebChatActivity): boolean {
  if (
    activity.type === 'typing' &&
    'text' in activity &&
    typeof activity.text === 'string' &&
    activity.channelData.streamType !== 'informative'
  ) {
    return true;
  }

  return false;
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
          ({ lastTypingActivity }) => !isFromUser(lastTypingActivity) && !isTypingLivestream(lastTypingActivity)
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
