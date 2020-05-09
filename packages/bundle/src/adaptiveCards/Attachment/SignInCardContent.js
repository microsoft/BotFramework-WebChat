import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const { useStyleSet } = hooks;

const SignInCardContent = ({ content, disabled }) => {
  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <CommonCard content={content} disabled={disabled} />
    </div>
  );
};

SignInCardContent.defaultProps = {
  disabled: undefined
};

SignInCardContent.propTypes = {
  content: PropTypes.any.isRequired,
  disabled: PropTypes.bool
};

export default SignInCardContent;
