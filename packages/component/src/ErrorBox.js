import PropTypes from 'prop-types';
import React from 'react';

import { localize } from './Localization/Localize';
import connectToWebChat from './connectToWebChat';
import ScreenReaderText from './ScreenReaderText';

const ErrorBox = ({ children, language, message, styleSet }) => (
  <React.Fragment>
    <ScreenReaderText text={localize('ErrorMessage', language)} />
    <div className={styleSet.errorBox}>
      <div>{message}</div>
      <div>{children}</div>
    </div>
  </React.Fragment>
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
