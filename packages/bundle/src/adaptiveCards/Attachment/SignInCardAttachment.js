import { connectToWebChat } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const SignInCardAttachment = ({ adaptiveCardHostConfig, adaptiveCards, attachment, styleSet }) => (
  <div className={styleSet.animationCardAttachment}>
    <CommonCard adaptiveCardHostConfig={adaptiveCardHostConfig} adaptiveCards={adaptiveCards} attachment={attachment} />
  </div>
);

SignInCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.any.isRequired,
  styleSet: PropTypes.shape({
    animationCardAttachment: PropTypes.any.isRequired,
    options: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(SignInCardAttachment);
