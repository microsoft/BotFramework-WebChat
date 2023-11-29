import { type WebChatActivity } from 'botframework-webchat-core';

import { type ActivityKey } from '../../../../types/ActivityKey';
import useActivityKeyerContext from './private/useContext';

/**
 * Gets a callback function, when called, will return a list of activity revision with a specific key.
 *
 * When an activity arrives, a unique key will be assigned to the activity.
 *
 * Although every key is unique, an activity could be revised over time. This callback function will
 * return all revisions of the same activity based on their chronological order.
 *
 * @returns A callback function, when called, will return a list of activity revision with a specific key.
 */
export default function useGetActivitiesByKey(): (key?: ActivityKey) => readonly Readonly<WebChatActivity>[] {
  return useActivityKeyerContext().getActivitiesByKey;
}
