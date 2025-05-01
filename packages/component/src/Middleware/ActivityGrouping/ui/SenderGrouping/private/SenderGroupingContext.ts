import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type ReactNode } from 'react';

type SenderGroupingContextType = Readonly<{
  firstActivityState: readonly [WebChatActivity];
  lastActivityState: readonly [WebChatActivity];
  // TODO: Should remove `renderAvatar` out and consider using `useRenderAvatar(firstActivityState)`.
  renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
}>;

const EMPTY_STATE = Object.freeze([undefined] as const);

// SenderGroupingContext may not available if `styleOptions.groupActivitiesBy` does not have `sender`.
const SenderGroupingContext = createContext<SenderGroupingContextType>({
  firstActivityState: EMPTY_STATE,
  lastActivityState: EMPTY_STATE,
  renderAvatar: false
});

export default SenderGroupingContext;
export { type SenderGroupingContextType };
