import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';
import { type DirectLineSignInCard } from 'botframework-webchat-core';

import CommonCard from './CommonCard';
import useStyleSet from '../../hooks/useStyleSet';

type SignInCardContentProps = Readonly<{
  actionPerformedClassName?: string;
  content: DirectLineSignInCard;
  disabled?: boolean;
}>;

const SignInCardContent = ({ actionPerformedClassName, content, disabled }: SignInCardContentProps): ReactNode => {
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
