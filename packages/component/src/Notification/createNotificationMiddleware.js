import React from 'react';

import BasicNotification from '../BasicNotification';

function createNotificationMiddleware() {
  return () => () => ({ notification }) => <BasicNotification notification={notification} />;
}

export default createNotificationMiddleware;
