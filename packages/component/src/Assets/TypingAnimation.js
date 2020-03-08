import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useStyleSet from '../hooks/useStyleSet';

const RTL_SCALE_CSS = css({ transform: 'scale(-1, 1)' });

const TypingAnimation = () => {
  const [{ typingAnimation: typingAnimationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const rtlScale = direction === 'rtl' ? RTL_SCALE_CSS + '' : '';

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('TYPING_INDICATOR_ALT')} />
      <div
        aria-hidden={true}
        className={classNames('webchat__typingIndicator', rtlScale + '', typingAnimationStyleSet + '')}
      />
    </React.Fragment>
  );
};

export default TypingAnimation;
