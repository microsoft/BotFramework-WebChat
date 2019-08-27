import PropTypes from 'prop-types';
import React from 'react';

import { useLocalize } from './Localization/Localize';
import ScreenReaderText from './ScreenReaderText';
import useStyleSet from './hooks/useStyleSet';

const ErrorBox = ({ children, message }) => {
  const styleSet = useStyleSet();
  const errorLabel = useLocalize('ErrorMessage');

  return (
    <React.Fragment>
      <ScreenReaderText text={errorLabel} />
      <div className={styleSet.errorBox}>
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
