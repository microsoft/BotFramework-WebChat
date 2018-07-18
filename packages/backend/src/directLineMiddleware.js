import connectionStatusUpdate from './Actions/connectionStatusUpdate';
import receiveActivity from './Actions/receiveActivity';

import { POST_ACTIVITY } from './Actions/postActivity';

export default function () {
  return store => {
    let directLine;

    return next => action => {
      const { payload } = action;

      switch (action.type) {
        case 'DIRECT_LINE/START':
          if (directLine) {
            // Implement logic to restart/kill connections
            throw new Error('already connected');
          }

          if (!subscriptions) {
            subscriptions = [
              payload.directLine.connectionStatus$.subscribe({
                next: readyState => store.dispatch(connectionStatusUpdate(readyState))
              }),
              payload.directLine.activity$.subscribe({
                next: activity => store.dispatch(receiveActivity(activity))
              })
            ];

            directLine = payload.directLine;
          }

          break;

        case POST_ACTIVITY:
          directLine.postActivity(action.payload.activity);

          break;
      }

      return next(action);
    };
  }
}
