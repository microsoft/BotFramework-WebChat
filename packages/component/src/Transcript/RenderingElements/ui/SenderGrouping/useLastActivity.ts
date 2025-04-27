import { type WebChatActivity } from 'botframework-webchat-core';
import useSenderGroupingContext from './private/useSenderGroupingContext';

export default function useLastActivity(): readonly [WebChatActivity] {
  return useSenderGroupingContext().lastActivityState;
}
