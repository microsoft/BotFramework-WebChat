import { type WebChatActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

type GroupedActivitiesAsMap = Map<string, GroupedActivities>;
type GroupedActivitiesAsObject = Readonly<{
  sender: GroupedActivities;
  status: GroupedActivities;
  [others: string]: GroupedActivities;
}>;

export default function useGroupActivities(
  as: 'map'
): ({ activities }: Readonly<{ activities: readonly WebChatActivity[] }>) => GroupedActivitiesAsMap;

export default function useGroupActivities(
  as?: 'object' | undefined
): ({ activities }: Readonly<{ activities: readonly WebChatActivity[] }>) => GroupedActivitiesAsObject;

export default function useGroupActivities(
  as?: 'map' | 'object' | undefined
): ({
  activities
}: Readonly<{ activities: readonly WebChatActivity[] }>) => GroupedActivitiesAsMap | GroupedActivitiesAsObject {
  const { groupActivities } = useWebChatAPIContext();

  if (as === 'map') {
    return ({ activities }) => {
      const result = groupActivities({ activities });

      return new Map<string, GroupedActivities>(Object.entries(result || {}));
    };
  }

  return groupActivities;
}
