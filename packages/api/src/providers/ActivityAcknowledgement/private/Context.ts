import { createContext } from 'react';

type ActivityAcknowledgementContextType = {
  getHasAcknowledgedByActivityKey: (activityKey: string) => boolean | undefined;
  getHasReadByActivityKey: (activityKey: string) => boolean | undefined;
  // hasAnyUnreadActivitiesState: readonly [boolean];
  lastAcknowledgedActivityKeyState: readonly [string];
  lastReadActivityKeyState: readonly [string];
  markAllAsAcknowledged: () => void;
  markActivityKeyAsRead: (activityKey: string) => void;
};

const ActivityAcknowledgementContext = createContext<ActivityAcknowledgementContextType>(undefined);

export default ActivityAcknowledgementContext;

export type { ActivityAcknowledgementContextType };
