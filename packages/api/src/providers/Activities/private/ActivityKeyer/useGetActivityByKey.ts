import { type WebChatActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';

import { type ActivityKey } from '../../../../types/ActivityKey';
import lastOf from '../../../../utils/lastOf';
import useActivityKeyerContext from './private/useContext';

/**
 * Gets a callback function, when call, will return the last revision of an activity with a specific key.
 *
 * When an activity arrives, a unique key will be assigned to the activity.
 *
 * Although every key is unique, an activity could be revised over time. This callback function will
 * return all revisions of the same activity based on their chronological order.
 *
 * @deprecated Use `useGetActivitiesByKey` instead.
 *
 * @returns A callback function, when call, will return the last revision of an activity with a specific key.
 */
export default function useGetActivityByKey(): (key?: ActivityKey) => undefined | Readonly<WebChatActivity> {
  const { getActivitiesByKey } = useActivityKeyerContext();

  return useCallback((key?: ActivityKey) => lastOf(getActivitiesByKey(key)), [getActivitiesByKey]);
}
