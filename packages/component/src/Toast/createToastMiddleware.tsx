/* eslint react/prop-types: "off" */

import { ToastMiddleware } from 'botframework-webchat-api';
import React from 'react';

import BasicToast from '../BasicToast';

function createToastMiddleware(): ToastMiddleware {
  return () =>
    () =>
    ({ notification }) =>
      <BasicToast notification={notification} />;
}

export default createToastMiddleware;
