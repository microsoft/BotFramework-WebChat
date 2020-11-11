import React from 'react';

import BasicSendBox from '../../BasicSendBox';

export default function createCoreMiddleware() {
  return () => next => (...args) => {
    const [{ sendBoxClassName }] = args;

    return <BasicSendBox className={sendBoxClassName} />;
  };
}
