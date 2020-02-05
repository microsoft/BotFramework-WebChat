import concatMiddleware from '../concatMiddleware';
import createBasicNotificationMiddlware from '../../Notification/createBasicNotificationMiddleware';

function createCoreMiddleware() {
  return concatMiddleware(
    () => next => args => {
      const {
        notification: { id }
      } = args;

      // We are ignoring "connectivitystatus" notifications, we will render it using <BasicConnectivityStatus> instead.
      // If devs want to render it, they can add a middleware.
      return id !== 'connectivitystatus' && next(args);
    },
    createBasicNotificationMiddlware()
  );
}

export default createCoreMiddleware;
