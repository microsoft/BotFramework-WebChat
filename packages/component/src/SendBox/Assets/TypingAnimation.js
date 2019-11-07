import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../../ScreenReaderText';
import useStyleSet from '../../hooks/useStyleSet';

const TypingAnimation = ({ 'aria-label': ariaLabel }) => {
  const [{ typingAnimation: typingAnimationStyleSet }] = useStyleSet();

  return (
    <React.Fragment>
      <ScreenReaderText text={ariaLabel} />
      <div aria-hidden={true} className={typingAnimationStyleSet} />
    </React.Fragment>
  );
};

TypingAnimation.propTypes = {
  'aria-label': PropTypes.string.isRequired
};

export default TypingAnimation;
