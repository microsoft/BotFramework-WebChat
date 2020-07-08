/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';
import concatMiddleware from './concatMiddleware';
import createCoreAttachmentMiddleware from './Attachment/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function createAttachmentRenderer(additionalMiddleware) {
  const attachmentMiddleware = concatMiddleware(additionalMiddleware, createCoreAttachmentMiddleware())({});

  return (...args) => {
    try {
      return attachmentMiddleware(({ attachment }) => (
        <ErrorBox message="No renderer for this attachment">
          <pre>{JSON.stringify(attachment, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      return (
        <ErrorBox error={err} message="Failed to render attachment">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}
