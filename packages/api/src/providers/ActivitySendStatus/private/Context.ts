import { createContext } from 'react';

import type { SendStatus } from '../SendStatus';

type ActivityStatusContextType = {
  sendStatusByActivityKeyState: readonly [ReadonlyMap<string, SendStatus>];
};

const ActivityStatusContext = createContext<ActivityStatusContextType>(
  // This is intentionally casted to `undefined`. We will do the checking in `useContext`.
  undefined as unknown as ActivityStatusContextType
);

export default ActivityStatusContext;

export type { ActivityStatusContextType };
