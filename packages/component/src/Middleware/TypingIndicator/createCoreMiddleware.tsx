import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks, TypingIndicatorMiddleware } from 'botframework-webchat-api';
import cx from 'classnames';
import React from 'react';

import TypingAnimation from '../../Assets/TypingAnimation';
import styles from './TypingIndicator.module.css';

const { useDirection, useLocalizer } = hooks;

const DotIndicator = () => {
  const [direction] = useDirection();
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const localize = useLocalizer();

  return (
    <div
      className={cx(classNames['typing-indicator-container'], {
        [classNames['typing-indicator--rtl']]: direction === 'rtl'
      })}
    >
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
