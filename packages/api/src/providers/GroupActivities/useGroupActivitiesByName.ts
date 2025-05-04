import { type WebChatActivity } from 'botframework-webchat-core';

import useGroupActivitiesContext from './private/useGroupActivitiesContext';

/**
 * This hook will return a callback function. When called with `activities`, the callback function will run the `groupActivitiesMiddleware` for the specified grouping name.
 *
 * Unlike the [`useGroupActivities`](#usegroupactivities) hook which provide result for all groupings, this hook only provide result for the specified grouping name and the grouping name must be one of the name specified in `styleOptions.groupActivitiesBy`.
 *
 * @returns Result of `groupActivitiesMiddleware` for the specified grouping name
 */
export default function useGroupActivitiesBy(): (
  activities: readonly WebChatActivity[],
  name: string
) => readonly (readonly WebChatActivity[])[] {
  return useGroupActivitiesContext().groupActivitiesByName;
}
