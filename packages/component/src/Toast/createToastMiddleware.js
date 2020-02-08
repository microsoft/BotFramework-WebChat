import React from 'react';

import BasicToast from '../BasicToast';

function createToastMiddleware() {
  return () => () => ({ notification }) => <BasicToast notification={notification} />;
}

export default createToastMiddleware;
