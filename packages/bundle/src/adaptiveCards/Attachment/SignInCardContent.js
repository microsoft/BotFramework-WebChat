import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const { useStyleSet } = hooks;

const SignInCardContent = ({ actionPerformedClassName, content, disabled }) => {
  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
};

SignInCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

SignInCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  content: PropTypes.any.isRequired,
  disabled: PropTypes.bool
};

export default SignInCardContent;
