import { useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import { useSelector } from '@msinternal/botframework-webchat-redux-store';
import { type WebChatActivity } from 'botframework-webchat-core';
import { memo, useEffect, useRef } from 'react';

const selectActivities = ({ activities }: { readonly activities: readonly WebChatActivity[] }) => activities;

// Keyed by local ID, falls back to the object itself.
const getKey = (activity: WebChatActivity): unknown => activity.channelData?.['webchat:internal:local-id'] ?? activity;

/** What was added, changed (same key, different object) and deleted since the last committed render. */
function diffActivities(previous: readonly WebChatActivity[], everything: readonly WebChatActivity[]) {
  const previousByKey = new Map(previous.map(activity => [getKey(activity), activity]));
  const keys = new Set(everything.map(getKey));

  return Object.freeze({
    added: Object.freeze(everything.filter(activity => !previousByKey.has(getKey(activity)))),
    changed: Object.freeze(
      everything.filter(activity => {
        const key = getKey(activity);

        return previousByKey.has(key) && !Object.is(previousByKey.get(key), activity);
      })
    ),
    deleted: Object.freeze(previous.filter(activity => !keys.has(getKey(activity)))),
    everything
  });
}

/**
 * Development only: throws if the activities of the graph differ from the activities in the Redux store.
 *
 * It renders when either changes, as `useActivities()` did when it ran this check. It reads the store with
 * `useSelector()`, as `<GraphProvider>` reads the graph and the store: one snapshot, so a store swap is not one render
 * behind.
 */
function ReduxActivitiesCrossCheck() {
  const [activitiesFromGraph] = useOrderedActivities();
  const activitiesFromRedux: readonly WebChatActivity[] = useSelector(selectActivities);
  const previousRef = useRef<{
    readonly activitiesFromGraph: readonly WebChatActivity[];
    readonly activitiesFromRedux: readonly WebChatActivity[];
  }>({ activitiesFromGraph: [], activitiesFromRedux: [] });

  // Only committed renders count as "previous".
  useEffect(() => {
    previousRef.current = { activitiesFromGraph, activitiesFromRedux };
  }, [activitiesFromGraph, activitiesFromRedux]);

  const getCause = () =>
    Object.freeze({
      activitiesFromGraph: diffActivities(previousRef.current.activitiesFromGraph, activitiesFromGraph),
      activitiesFromRedux: diffActivities(previousRef.current.activitiesFromRedux, activitiesFromRedux)
    });

  if (activitiesFromGraph.length !== activitiesFromRedux.length) {
    throw new Error(
      `botframework-webchat-internal: Activities from graph and Redux are of different size (graph has ${activitiesFromGraph.length} activities, Redux has ${activitiesFromRedux.length} activities)`,
      { cause: getCause() }
    );
  }

  for (let index = 0; index < activitiesFromGraph.length; index++) {
    if (!Object.is(activitiesFromGraph.at(index), activitiesFromRedux.at(index))) {
      throw new Error(
        `botframework-webchat-internal: Activities from graph and Redux are different at index ${index}`,
        { cause: Object.freeze({ ...getCause(), index }) }
      );
    }
  }

  return null;
}

ReduxActivitiesCrossCheck.displayName = 'ReduxActivitiesCrossCheck';

export default memo(ReduxActivitiesCrossCheck);
