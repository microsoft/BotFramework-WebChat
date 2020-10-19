/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';

import concatMiddleware from './concatMiddleware';
import createCoreMiddleware from './AttachmentForScreenReader/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function applyAttachmentForScreenReaderMiddleware(additionalMiddleware) {
  const activityMiddleware = concatMiddleware(additionalMiddleware, createCoreMiddleware())({});

  return (...args) => {
    try {
      return activityMiddleware(() => false)(...args);
    } catch (err) {
      const FailedRenderAttachmentForScreenReader = () => (
        <ErrorBox error={err} message="Failed to render attachment for screen reader">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );

      return FailedRenderAttachmentForScreenReader;
    }
  };
}
