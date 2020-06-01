import PropTypes from 'prop-types';
import React from 'react';

import SignInCardContent from './SignInCardContent';

const SignInCardAttachment = ({ attachment: { content }, disabled }) => (
  <SignInCardContent content={content} disabled={disabled} />
);

SignInCardAttachment.defaultProps = {
  disabled: undefined
};

SignInCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.any.isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default SignInCardAttachment;
