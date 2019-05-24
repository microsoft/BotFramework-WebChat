import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import TypingAnimation from './Assets/TypingAnimation';

const TypingActivity = ({ styleSet }) => (
  <div className={styleSet.typingActivity}>
    <TypingAnimation />
  </div>
);

TypingActivity.propTypes = {
  styleSet: PropTypes.shape({
    typingActivity: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(TypingActivity);
