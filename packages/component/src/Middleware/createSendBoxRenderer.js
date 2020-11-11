/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';
import concatMiddleware from './concatMiddleware';
import createCoreAttachmentMiddleware from './SendBox/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function createSendBoxRenderer(additionalMiddleware) {
  const sendBoxMiddleware = concatMiddleware(additionalMiddleware, createCoreAttachmentMiddleware())({});

  return (...args) => {
    try {
      return sendBoxMiddleware(({ attachment }) => (
        <ErrorBox message="No renderer for the send box">
          <pre>{JSON.stringify(attachment, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      return (
        <ErrorBox error={err} message="Failed to render send box">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}
