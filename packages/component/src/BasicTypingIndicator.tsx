import { hooks } from 'botframework-webchat-api';
import React, { Fragment, type ReactNode } from 'react';

const { useActiveTyping, useRenderTypingIndicator } = hooks;

function useTypingIndicatorVisible(): [boolean] {
  const [activeTyping] = useActiveTyping();

  return [!!Object.values(activeTyping).filter(({ role }) => role !== 'user').length];
}

const BasicTypingIndicator = (): ReactNode => {
  const [activeTyping] = useActiveTyping();
  const [visible] = useTypingIndicatorVisible();
  const [typing] = useActiveTyping(Infinity);
  const renderTypingIndicator = useRenderTypingIndicator();

  return <Fragment>{renderTypingIndicator({ activeTyping, typing, visible })}</Fragment>;
};

export default BasicTypingIndicator;

export { useTypingIndicatorVisible };
