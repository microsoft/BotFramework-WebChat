/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React from 'react';
import concatMiddleware from './concatMiddleware';
import createCoreAvatarMiddleware from './Avatar/createCoreMiddleware';
import ErrorBox from '../ErrorBox';

export default function createAvatarRenderer(additionalMiddleware) {
  const avatarMiddleware = concatMiddleware(additionalMiddleware, createCoreAvatarMiddleware())({});

  return (...args) => {
    try {
      return avatarMiddleware(() => false)(...args);
    } catch (err) {
      const { message, stack } = err;

      console.error({ message, stack });

      return (
        <ErrorBox error={err} message="Failed to render avatar">
          <pre>{JSON.stringify({ message, stack }, null, 2)}</pre>
        </ErrorBox>
      );
    }
  };
}
