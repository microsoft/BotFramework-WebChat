import { createContext } from 'react';

import { type ActivityKey } from '../../../types/ActivityKey';

// TODO: [P1] It seems acknowledgement is only for transcript scrolling and not very beneficial to everyone.
//            We should move acknowledgement logic to transcript.
type ActivityAcknowledgementContextType = {
  activityKeysByReadState: readonly [readonly ActivityKey[], readonly ActivityKey[]];
  getHasAcknowledgedByActivityKey: (activityKey: ActivityKey) => boolean | undefined;
  lastAcknowledgedActivityKeyState: readonly [ActivityKey];
  lastReadActivityKeyState: readonly [ActivityKey];
  markActivityKeyAsRead: (activityKey: ActivityKey) => void;
  markAllAsAcknowledged: () => void;
};

const ActivityAcknowledgementContext = createContext<ActivityAcknowledgementContextType>(undefined);

export default ActivityAcknowledgementContext;

export type { ActivityAcknowledgementContextType };
