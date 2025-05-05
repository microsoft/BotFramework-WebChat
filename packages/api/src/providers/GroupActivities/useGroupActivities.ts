import { type WebChatActivity } from 'botframework-webchat-core';

import useGroupActivitiesContext from './private/useGroupActivitiesContext';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

/**
 * This hook will return a callback function. When called with `activities`, the callback function will run the `groupActivitiesMiddleware` and will return all groupings.
 *
 * @deprecated This function is deprecated and will be removed on or after 2027-05-04. Developers should migrate to [`useGroupActivitiesByName`](#usegroupactivitiesbyname) for performance reason.
 */
export default function useGroupActivities(): ({
  activities
}: Readonly<{
  activities: readonly WebChatActivity[];
}>) => Readonly<{
  [key: string]: GroupedActivities;
}> {
  return useGroupActivitiesContext().groupActivities;
}
