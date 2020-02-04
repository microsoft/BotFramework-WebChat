import React from 'react';

import BasicNotification from './BasicNotification';

function createBasicNotificationMiddleware() {
  return () => () => ({ notification: { alt, id, level, message, persistent } }) => (
    <BasicNotification alt={alt} level={level} message={message} notificationId={id} persistent={persistent} />
  );
}

export default createBasicNotificationMiddleware;
