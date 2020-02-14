import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useDirection from '../hooks/useDirection';
import useStyleSet from '../hooks/useStyleSet';

const RTL_SCALE_CSS = css({ transform: 'scale(-1, 1)' });

const TypingAnimation = ({ 'aria-label': ariaLabel }) => {
  const [{ typingAnimation: typingAnimationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const rtlScale = direction === 'rtl' ? RTL_SCALE_CSS + '' : '';

  return (
    <React.Fragment>
      <ScreenReaderText text={ariaLabel} />
      <div aria-hidden={true} className={classNames(rtlScale + '', typingAnimationStyleSet + '')} />
    </React.Fragment>
  );
};

TypingAnimation.propTypes = {
  'aria-label': PropTypes.string.isRequired
};

export default TypingAnimation;
