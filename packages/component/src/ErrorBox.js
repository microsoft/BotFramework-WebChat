import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from './connectToWebChat';

const ErrorBox = ({ children, message, styleSet }) => (
  <div className={styleSet.errorBox}>
    <div>{message}</div>
    <div>{children}</div>
  </div>
);

ErrorBox.defaultProps = {
  children: undefined,
  message: ''
};

ErrorBox.propTypes = {
  children: PropTypes.any,
  message: PropTypes.string,
  styleSet: PropTypes.shape({
    errorBox: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(ErrorBox);
