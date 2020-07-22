/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';
import concatMiddleware from './concatMiddleware';
import createCoreActivityStatusMiddleware from './ActivityStatus/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function createActivityStatusRenderer(additionalMiddleware) {
  const activityStatusMiddleware = concatMiddleware(additionalMiddleware, createCoreActivityStatusMiddleware())({});

  return (...args) => {
    try {
      return activityStatusMiddleware(() => false)(...args);
    } catch (err) {
      const { message, stack } = err;

      const FailedRenderActivityStatus = () => (
        <ErrorBox error={err} message="Failed to render activity status">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );

      return FailedRenderActivityStatus;
    }
  };
}
