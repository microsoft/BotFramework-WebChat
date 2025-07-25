import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type PartGroupingContextType = Readonly<{
  activities: readonly WebChatActivity[];
}>;

const EMPTY_STATE = Object.freeze([] as const);

// PartGroupingContext may not available if `styleOptions.groupActivitiesBy` does not have `status`.
const PartGroupingContext = createContext<PartGroupingContextType>({
  activities: EMPTY_STATE
});

export default PartGroupingContext;
export { type PartGroupingContextType };
