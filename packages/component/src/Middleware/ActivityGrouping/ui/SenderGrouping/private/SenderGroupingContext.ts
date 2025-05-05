import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type SenderGroupingContextType = Readonly<{
  firstActivityState: readonly [WebChatActivity];
  lastActivityState: readonly [WebChatActivity];
}>;

const EMPTY_STATE = Object.freeze([undefined] as const);

// SenderGroupingContext may not available if `styleOptions.groupActivitiesBy` does not have `sender`.
const SenderGroupingContext = createContext<SenderGroupingContextType>({
  firstActivityState: EMPTY_STATE,
  lastActivityState: EMPTY_STATE
});

export default SenderGroupingContext;
export { type SenderGroupingContextType };
