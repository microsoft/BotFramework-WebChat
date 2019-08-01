import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from './connectToWebChat';
import { localize } from './Localization/Localize';

const ErrorBox = ({ children, language, message, styleSet }) => (
  <div aria-label={localize('ErrorMessage', language)} className={styleSet.errorBox}>
    <div aria-label={message}>{message}</div>
    <div>{children}</div>
  </div>
);

ErrorBox.defaultProps = {
  children: undefined,
  message: ''
};

ErrorBox.propTypes = {
  children: PropTypes.any,
  language: PropTypes.string.isRequired,
  message: PropTypes.string,
  styleSet: PropTypes.shape({
    errorBox: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ language, styleSet }) => ({ language, styleSet }))(ErrorBox);
