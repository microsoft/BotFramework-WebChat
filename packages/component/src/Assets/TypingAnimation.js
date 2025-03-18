import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import testIds from '../testIds';
import useStyleSet from '../hooks/useStyleSet';

const { useDirection, useLocalizer } = hooks;

const ROOT_STYLE = {
  '&.webchat__typing-indicator.webchat__typing-indicator--rtl': { transform: 'scale(-1, 1)' }
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
          'webchat__typing-indicator',
          {
            'webchat__typing-indicator--rtl': direction === 'rtl'
          },
          rootClassName,
          typingAnimationStyleSet + ''
        )}
        data-testid={testIds.typingIndicator}
      />
    </React.Fragment>
  );
};

export default TypingAnimation;
