import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const { useStyleSet } = hooks;

const SignInCardAttachment = ({ adaptiveCardHostConfig, adaptiveCards, attachment }) => {
  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <CommonCard
        adaptiveCardHostConfig={adaptiveCardHostConfig}
        adaptiveCards={adaptiveCards}
        attachment={attachment}
      />
    </div>
  );
};

SignInCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.any.isRequired
};

export default SignInCardAttachment;
