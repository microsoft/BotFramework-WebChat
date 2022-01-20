import { createContext } from 'react';

import { ActivityAcknowledgement } from './types';

type ActivityAcknowledgementContextType = {
  activityAcknowledgementsState: readonly [Readonly<Map<string, ActivityAcknowledgement>>];
  hasUnreadState: readonly [boolean];
  lastAcknowledgedActivityKeyState: readonly [string];
  lastReadActivityKeyState: readonly [string];
  markAllAsAcknowledged: () => void;
  markAsRead: (activityKey: string) => void;
};

const ActivityAcknowledgementContext = createContext<ActivityAcknowledgementContextType>(undefined);

export default ActivityAcknowledgementContext;

export type { ActivityAcknowledgementContextType };
