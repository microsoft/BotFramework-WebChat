import PropTypes from 'prop-types';
import React, { createElement, useCallback, useState } from 'react';

import ErrorBoundary from '../utils/ErrorBoundary';
import useErrorBoxClass from '../internal/useErrorBoxClass';
import useTrackException from '../useTrackException';

const UserlandBoundary = ({ children, type }) => {
  const [error, setError] = useState();
  const [errorBoxClass] = useErrorBoxClass();
  const trackException = useTrackException();

  const handleError = useCallback(error => {
    setError(error);

    const errorObject = error || new Error(type);

    trackException(errorObject, false);

    console.group(`botframework-webchat: ${type}`);
    console.error(errorObject);
    console.groupEnd();
  }, [trackException]);

  return error ? (
    !!errorBoxClass && createElement(errorBoxClass, { error, type })
  ) : (
    <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>
  );
};

UserlandBoundary.defaultProps = {
  children: undefined,
  type: undefined
};

UserlandBoundary.propTypes = {
  children: PropTypes.any,
  type: PropTypes.string
};

export default UserlandBoundary;
