import { useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import type { WebChatActivity } from 'botframework-webchat-core';

import { useSelector, useStore } from './internal/WebChatReduxContext';
import usePrevious from './internal/usePrevious';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

function useActivitiesForProduction(): readonly [readonly WebChatActivity[]] {
  return useOrderedActivities();
}

function useActivitiesForDevelopment(): readonly [readonly WebChatActivity[]] {
  const activitiesFromGraphState = useActivitiesForProduction();

  // Checks if store changed.
  const store = useStore();
  const prevStore = usePrevious(store);

  const [activitiesFromGraph] = activitiesFromGraphState;

  const activitiesFromRedux = useSelector(({ activities }) => activities);

  // If store changed, skip one assertion turn.
  // This is because <GraphProvider> is using `useState()` for propagating changes.
  // It is always one render behind if `store` changed.
  if (prevStore === store) {
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
          `botframework-webchat-internal: Activities from graph and Redux are different at index ${index}`,
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

const useActivities: () => readonly [readonly WebChatActivity[]] =
  process.env.NODE_ENV === 'production' ? useActivitiesForProduction : useActivitiesForDevelopment;

export default useActivities;
