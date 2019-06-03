import { connectToWebChat } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const SignInCardAttachment = ({ adaptiveCards, attachment, styleSet }) => (
  <div className={styleSet.animationCardAttachment}>
    <CommonCard adaptiveCards={adaptiveCards} attachment={attachment} />
  </div>
);

SignInCardAttachment.propTypes = {
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.any.isRequired,
  styleSet: PropTypes.shape({
    animationCardAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(SignInCardAttachment);
