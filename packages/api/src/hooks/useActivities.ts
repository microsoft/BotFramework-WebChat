import { useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import type { WebChatActivity } from 'botframework-webchat-core';

import { useSelector } from './internal/WebChatReduxContext';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

export default function useActivities(): readonly [readonly WebChatActivity[]] {
  const activitiesFromGraphState = useOrderedActivities();

  // ASSERTION: Before we fully migrate to graph, make sure graph and Redux are the same.
  if (process.env.NODE_ENV !== 'production') {
    const [activitiesFromGraph] = activitiesFromGraphState;

    // Assert based on NODE_ENV.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const activitiesFromRedux = useSelector(({ activities }) => activities);

    if (activitiesFromGraph.length !== activitiesFromRedux.length) {
      throw new Error(
        `botframework-webchat-internal: Activities from graph and Redux are of different size (graph has ${activitiesFromGraph.length} activities, Redux has ${activitiesFromRedux.length} activities)`,
        {
          cause: {
            activitiesFromGraph,
            activitiesFromRedux
          }
        }
      );
    }

    for (let index = 0; index < activitiesFromGraph.length; index++) {
      if (!Object.is(activitiesFromGraph.at(index), activitiesFromRedux.at(index))) {
        throw new Error(
          `botframework-webchat-internal: Activities from graph and Redux are of different at index ${index}`,
          {
            cause: {
              activitiesFromGraph,
              activitiesFromRedux,
              index
            }
          }
        );
      }
    }
  }

  return activitiesFromGraphState;
}
