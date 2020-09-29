/* eslint no-console: "off" */

import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import ScreenReaderText from './ScreenReaderText';
import useStyleSet from './hooks/useStyleSet';

const { useLocalizer, useTrackException } = hooks;

const ErrorBox = ({ error, type }) => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const trackException = useTrackException();

  useEffect(() => {
    const errorObject = error || new Error(type);

    trackException(errorObject, false);

    console.group(`botframework-webchat: ${type}`);
    console.error(errorObject);
    console.groupEnd();
  }, [error, type, trackException]);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_ERROR_BOX_TITLE')} />
      <div className={errorBoxStyleSet}>
        <div>{type}</div>
        <div>{error.stack}</div>
      </div>
    </React.Fragment>
  );
};

ErrorBox.defaultProps = {
  children: undefined,
  error: undefined,
  type: ''
};

ErrorBox.propTypes = {
  children: PropTypes.any,
  error: PropTypes.instanceOf(Error).isRequired,
  type: PropTypes.string
};

export default ErrorBox;
