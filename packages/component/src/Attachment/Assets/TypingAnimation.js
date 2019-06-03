import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../../connectToWebChat';

const TypingAnimation = ({ styleSet }) => <div className={styleSet.typingAnimation} />;

TypingAnimation.propTypes = {
  styleSet: PropTypes.shape({
    typingAnimation: PropTypes.any.isRequired
  }).isRequired
};

const ConnectedTypingAnimation = connectToWebChat(({ styleSet }) => ({ styleSet }))(TypingAnimation);

export default ConnectedTypingAnimation;
