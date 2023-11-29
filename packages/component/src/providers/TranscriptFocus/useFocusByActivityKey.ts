import { type ActivityKey } from 'botframework-webchat-api';

import useTranscriptFocusContext from './private/useContext';

/**
 * Put the focus on an activity based on its activity key.
 *
 * @param {ActivityKey | boolean | undefined} activityKey - The activity key to focus on, `false` to reset focus to most recent activity, `true` to focus on anything, `undefined` for not changing the focus.
 * @param {boolean} withFocus - `true` if the user agent focus should be sent to the transcript, otherwise, `false`.
 */
export default function useFocusByActivityKey(): (
  activityKey: ActivityKey | boolean | undefined,
  withFocus?: boolean
) => void {
  return useTranscriptFocusContext().focusByActivityKey;
}
