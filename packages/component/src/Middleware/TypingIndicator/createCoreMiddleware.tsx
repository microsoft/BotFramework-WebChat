import { hooks, TypingIndicatorMiddleware } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import TypingAnimation from '../../Assets/TypingAnimation';
import useStyleSet from '../../hooks/useStyleSet';

const { useDirection, useLocalizer } = hooks;

const DotIndicator = () => {
  const [{ typingIndicator: typingIndicatorStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  return (
    <div className={classNames(typingIndicatorStyleSet + '', direction === 'rtl' && 'webchat__typingIndicator--rtl')}>
      <TypingAnimation aria-label={localize('TYPING_INDICATOR_ALT')} />
    </div>
  );
};

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware(): TypingIndicatorMiddleware[] {
  return [
    () =>
      () =>
      ({ visible }) =>
        visible && <DotIndicator />
  ];
}
