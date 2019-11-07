import PropTypes from 'prop-types';
import React from 'react';

import { localize } from './Localization/Localize';
import connectToWebChat from './connectToWebChat';
import ScreenReaderText from './ScreenReaderText';
import useStyleSet from './hooks/useStyleSet';

const ErrorBox = ({ children, language, message }) => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ErrorMessage', language)} />
      <div className={errorBoxStyleSet}>
        <div>{message}</div>
        <div>{children}</div>
      </div>
    </React.Fragment>
  );
};

ErrorBox.defaultProps = {
  children: undefined,
  message: ''
};

ErrorBox.propTypes = {
  children: PropTypes.any,
  language: PropTypes.string.isRequired,
  message: PropTypes.string
};

export default connectToWebChat(({ language }) => ({ language }))(ErrorBox);
