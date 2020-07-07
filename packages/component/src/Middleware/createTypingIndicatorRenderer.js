/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';
import concatMiddleware from './concatMiddleware';
import createCoreTypingIndicatorMiddleware from './TypingIndicator/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function createTypingIndicatorRenderer(additionalMiddleware) {
  const typingIndicatorMiddleware = concatMiddleware(additionalMiddleware, createCoreTypingIndicatorMiddleware())({});

  return (...args) => {
    try {
      return typingIndicatorMiddleware(({ activeTyping, typing, visible }) => (
        <ErrorBox message="No renderer for typing indicator">
          <pre>{JSON.stringify({ activeTyping, typing, visible }, null, 2)}</pre>
        </ErrorBox>
      ))(...args);
    } catch (err) {
      const { message, stack } = err;

      console.error({ message, stack });

      return (
        <ErrorBox error={err} message="Failed to render typing indicator">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}
