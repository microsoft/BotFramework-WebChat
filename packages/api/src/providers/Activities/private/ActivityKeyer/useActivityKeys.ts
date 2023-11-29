import useActivityKeyerContext from './private/useContext';

import { type ActivityKey } from '../../../../types/ActivityKey';

/**
 * Subscribes and gets all activity keys in the chat history.
 *
 * The order of the keys should be based on the first revision of the activity.
 * In other words, once a key is assigned to an activity, the position will be fixed.
 *
 * @returns All activity keys in the chat history.
 */
export default function useActivityKeys(): readonly [readonly ActivityKey[]] {
  // TODO: We should fix the reference issue. When any activities is updated, we should create a new callback.
  return useActivityKeyerContext().activityKeysState;
}
