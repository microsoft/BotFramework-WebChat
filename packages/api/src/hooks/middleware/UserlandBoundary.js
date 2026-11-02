import { ErrorBoxPolymiddlewareProxy } from '@msinternal/botframework-webchat-api-middleware';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { useCallback, useState } from 'react';
import { nullish, object, pipe, readonly, string } from 'valibot';

import ErrorBoundary from '../utils/ErrorBoundary';

const userlandBoundaryPropsSchema = pipe(
  object({
    children: nullish(reactNode()),
    type: nullish(string())
  }),
  readonly()
);

const UserlandBoundary = props => {
  const { children, type } = validateProps(userlandBoundaryPropsSchema, props);
  const [error, setError] = useState();

  const handleError = useCallback(error => setError(error), []);

  return error ? (
    <ErrorBoxPolymiddlewareProxy error={error} where={type} />
  ) : (
    <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>
  );
};

export default UserlandBoundary;
