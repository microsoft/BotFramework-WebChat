import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from './ScreenReaderText';
import useLocalizer from './hooks/useLocalizer';
import useStyleSet from './hooks/useStyleSet';

const ErrorBox = ({ children, message }) => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const errorMessageText = useLocalizer()('ACTIVITY_ERROR_BOX_TITLE');

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
