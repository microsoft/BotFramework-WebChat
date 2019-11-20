import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from './ScreenReaderText';
import useLocalize from './hooks/useLocalize';
import useStyleSet from './hooks/useStyleSet';

const ErrorBox = ({ children, message }) => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const errorMessageText = useLocalize('ErrorMessage');

  return (
    <React.Fragment>
      <ScreenReaderText text={errorMessageText} />
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
  message: PropTypes.string
};

export default ErrorBox;
