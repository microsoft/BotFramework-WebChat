import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const { useStyleSet } = hooks;

const SignInCardAttachment = ({ attachment }) => {
  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <CommonCard attachment={attachment} />
    </div>
  );
};

SignInCardAttachment.propTypes = {
  attachment: PropTypes.any.isRequired
};

export default SignInCardAttachment;
