import BasicNotification from './BasicNotification';

function createBasicNotificationMiddleware() {
  return () => () => ({ alt, level, message, notificationId, persistent }) => (
    <BasicNotification
      alt={alt}
      level={level}
      message={message}
      notificationId={notificationId}
      persistent={persistent}
    />
  );
}

export default createBasicNotificationMiddleware;
