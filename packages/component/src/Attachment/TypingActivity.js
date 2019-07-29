import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import TypingAnimation from './Assets/TypingAnimation';

const TypingActivity = ({ language, styleSet }) => (
  <div className={styleSet.typingActivity}>
    <TypingAnimation ariaLabel={localize('TypingIndicator', language)} />
  </div>
);

TypingActivity.propTypes = {
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    typingActivity: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(TypingActivity);
