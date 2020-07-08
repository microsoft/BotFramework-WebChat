/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';
import concatMiddleware from './concatMiddleware';
import createCoreToastMiddleware from './Toast/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function createToastRenderer(additionalMiddleware) {
  const toastMiddleware = concatMiddleware(additionalMiddleware, createCoreToastMiddleware())({});

  return (...args) => {
    try {
      return toastMiddleware(({ notification }) => (
        <ErrorBox message="No renderer for this notification">
          <pre>{JSON.stringify(notification, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      const { message, stack } = err;

      console.error({ message, stack });

      return (
        <ErrorBox error={err} message="Failed to render notification">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}
