/* eslint no-console: "off" */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import ScreenReaderText from './ScreenReaderText';
import useLocalizer from './hooks/useLocalizer';
import useStyleSet from './hooks/useStyleSet';
import useTrackException from './hooks/useTrackException';

const ErrorBox = ({ children, error, message }) => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const trackException = useTrackException();

  useEffect(() => {
    const errorObject = error || new Error(message);

    trackException(errorObject, false);

    console.group(`botframework-webchat: ${message}`);
    console.error(errorObject);
    console.groupEnd();
  }, [error, message, trackException]);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_ERROR_BOX_TITLE')} />
      <div className={errorBoxStyleSet}>
        <div>{message}</div>
        <div>{children}</div>
      </div>
    </React.Fragment>
  );
};

ErrorBox.defaultProps = {
  children: undefined,
  error: undefined,
  message: ''
};

ErrorBox.propTypes = {
  children: PropTypes.any,
  error: PropTypes.instanceOf(Error),
  message: PropTypes.string
};

export default ErrorBox;
