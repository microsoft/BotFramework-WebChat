import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type StatusGroupingContextType = Readonly<{
  firstActivityState: readonly [WebChatActivity];
  lastActivityState: readonly [WebChatActivity];
}>;

const EMPTY_STATE = Object.freeze([undefined] as const);

// StatusGroupingContext may not available if `styleOptions.groupActivitiesBy` does not have `status`.
const StatusGroupingContext = createContext<StatusGroupingContextType>({
  firstActivityState: EMPTY_STATE,
  lastActivityState: EMPTY_STATE
});

export default StatusGroupingContext;
export { type StatusGroupingContextType };
