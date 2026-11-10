import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React from 'react';

import styles from '../Middleware/TypingIndicator/TypingIndicator.module.css';
import ScreenReaderText from '../ScreenReaderText';
import testIds from '../testIds';

const { useDirection, useLocalizer } = hooks;

const TypingAnimation = () => {
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [direction] = useDirection();
  const localize = useLocalizer();

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('TYPING_INDICATOR_ALT')} />
      <div
        aria-hidden={true}
        className={cx(classNames['typing-indicator'], {
          [classNames['typing-indicator--rtl']]: direction === 'rtl'
        })}
        data-testid={testIds.typingIndicator}
      />
    </React.Fragment>
  );
};

export default TypingAnimation;
