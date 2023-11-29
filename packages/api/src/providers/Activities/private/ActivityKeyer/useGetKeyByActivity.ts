import { type WebChatActivity } from 'botframework-webchat-core';

import { type ActivityKey } from '../../../../types/ActivityKey';
import useActivityKeyerContext from './private/useContext';

/**
 * Gets a callback function, when called, will return the key of a specific activity.
 *
 * @returns A callback function, when called, will return the key of a specific activity.
 */
export default function useGetKeyByActivity(): (activity?: WebChatActivity) => ActivityKey | undefined {
  return useActivityKeyerContext().getKeyByActivity;
}
