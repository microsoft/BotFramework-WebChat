import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';

import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useDirection, useLocalizer } = hooks;

const ROOT_STYLE = {
  '&.webchat__typingIndicator.webchat__typingIndicator--rtl': { transform: 'scale(-1, 1)' }
};

const TypingAnimation = () => {
  const [{ typingAnimation: typingAnimationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('TYPING_INDICATOR_ALT')} />
      <div
        aria-hidden={true}
        className={classNames(
          'webchat__typingIndicator',
          {
            'webchat__typingIndicator--rtl': direction === 'rtl'
          },
          rootClassName,
          typingAnimationStyleSet + ''
        )}
      />
    </React.Fragment>
  );
};

export default TypingAnimation;
