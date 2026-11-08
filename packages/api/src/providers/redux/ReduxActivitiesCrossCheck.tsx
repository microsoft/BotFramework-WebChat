import { useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import { type WebChatActivity } from 'botframework-webchat-core';
import { memo, useMemo } from 'react';

import { useWebChatReduxContext } from '../../hooks/internal/WebChatReduxContext';
import useSourceValue from '../../hooks/internal/domains/useSourceValue';
import usePrevious from '../../hooks/internal/usePrevious';

/**
 * Development only: throws if the activities of the graph differ from the activities in the Redux store.
 *
 * It renders when either changes, as `useActivities()` did when it ran this check.
 */
function ReduxActivitiesCrossCheck() {
  const [activitiesFromGraph] = useOrderedActivities();

  // Checks if store changed.
  const { store, subscribe } = useWebChatReduxContext();
  const prevStore = usePrevious(store);

  const activitiesFromRedux = useSourceValue<readonly WebChatActivity[]>(
    useMemo(() => Object.freeze({ get: () => store.getState().activities, subscribe }), [store, subscribe])
  );

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

  return null;
}

ReduxActivitiesCrossCheck.displayName = 'ReduxActivitiesCrossCheck';

export default memo(ReduxActivitiesCrossCheck);
