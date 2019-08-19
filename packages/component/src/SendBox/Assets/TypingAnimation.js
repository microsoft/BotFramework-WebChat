import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../../connectToWebChat';
import ScreenReaderText from '../../ScreenReaderText';

const TypingAnimation = ({ 'aria-label': ariaLabel, styleSet }) => (
  <React.Fragment>
    <ScreenReaderText text={ariaLabel} />
    <div aria-hidden={true} className={styleSet.typingAnimation} />
  </React.Fragment>
);

TypingAnimation.propTypes = {
  'aria-label': PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    typingAnimation: PropTypes.any.isRequired
  }).isRequired
};

const ConnectedTypingAnimation = connectToWebChat(({ styleSet }) => ({ styleSet }))(TypingAnimation);

export default ConnectedTypingAnimation;
