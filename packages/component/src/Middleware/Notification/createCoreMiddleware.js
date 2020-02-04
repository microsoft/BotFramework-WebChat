import concatMiddleware from '../concatMiddleware';
import createBasicNotificationMiddlware from '../../Notification/createBasicNotificationMiddleware';
import createConnectivityStatusMiddleware from '../../Notification/ConnectivityStatus/createMiddleware';

function createCoreMiddleware() {
  return concatMiddleware(createConnectivityStatusMiddleware(), createBasicNotificationMiddlware());
}

export default createCoreMiddleware;
