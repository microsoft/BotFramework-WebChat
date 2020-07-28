import concatMiddleware from '../concatMiddleware';
import createToastMiddleware from '../../Toast/createToastMiddleware';

function createCoreMiddleware() {
  return concatMiddleware(
    () => next => (...args) => {
      const [
        {
          notification: { id }
        }
      ] = args;

      // We are ignoring "connectivitystatus" notifications, we will render it using <BasicConnectivityStatus> instead.
      // If devs want to render it, they can add a middleware.
      return id !== 'connectivitystatus' && next(...args);
    },
    createToastMiddleware()
  );
}

export default createCoreMiddleware;
