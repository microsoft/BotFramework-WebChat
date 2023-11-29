import { createContext } from 'react';

import { type ActivityKey } from '../../../types/ActivityKey';
import { type SendStatus } from '../../../types/internal/SendStatus';

type ActivitySendStatusContextType = {
  sendStatusByActivityKeyState: readonly [ReadonlyMap<ActivityKey, SendStatus>];
};

const ActivitySendStatusContext = createContext<ActivitySendStatusContextType>(
  // This is intentionally casted to `undefined`. We will do the checking in `useContext`.
  undefined as unknown as ActivitySendStatusContextType
);

export default ActivitySendStatusContext;

export type { ActivitySendStatusContextType };
