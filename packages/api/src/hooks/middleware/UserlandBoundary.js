import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import ErrorBoundary from '../utils/ErrorBoundary';
import useErrorBoxClass from '../internal/useErrorBoxClass';

const UserlandBoundary = ({ children, type }) => {
  const [error, setError] = useState();
  const [errorBoxClass] = useErrorBoxClass();
  const handleError = useCallback(({ error }) => setError(error));

  // console.log('UserlandBoundary', { children });

  return error ? (
    React.createElement(errorBoxClass, { error, type })
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
