import { createContext } from 'react';

// TODO: [P1] It seems acknowledgement is only for transcript scrolling and not very beneficial to everyone.
//            We should move acknowledgement logic to transcript.
type ActivityAcknowledgementContextType = {
  activityKeysByReadState: readonly [readonly string[], readonly string[]];
  getHasAcknowledgedByActivityKey: (activityKey: string) => boolean | undefined;
  lastAcknowledgedActivityKeyState: readonly [string];
  lastReadActivityKeyState: readonly [string];
  markActivityKeyAsRead: (activityKey: string) => void;
  markAllAsAcknowledged: () => void;
};

const ActivityAcknowledgementContext = createContext<ActivityAcknowledgementContextType>(undefined);

export default ActivityAcknowledgementContext;

export type { ActivityAcknowledgementContextType };
