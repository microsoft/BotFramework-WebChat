import { hooks } from 'botframework-webchat-api';
import React, { Fragment, useMemo } from 'react';

const { useActiveTyping, useRenderTypingIndicator } = hooks;

function useTypingIndicatorVisible(): readonly [boolean] {
  const [activeTyping] = useActiveTyping();

  return useMemo(
    () =>
      Object.freeze([
        !!Object.values(activeTyping).some(
          // Show typing indicator if anyone is typing and not livestreaming.
          ({ role, type }) => role !== 'user' && type !== 'livestream'
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
