import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { ErrorBoxPolymiddlewareProxy } from '../../package-api-middleware/index';
import ErrorBoundary from '../utils/ErrorBoundary';

const UserlandBoundary = ({ children, type }) => {
  const [error, setError] = useState();

  const handleError = useCallback(error => setError(error), []);

  return error ? (
    <ErrorBoxPolymiddlewareProxy error={error} where={type} />
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
