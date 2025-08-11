import { type WebChatActivity } from 'botframework-webchat-core';
import useStatusGroupingContext from './private/useStatusGroupingContext';

export default function useLastActivity(): readonly [WebChatActivity] {
  return useStatusGroupingContext().lastActivityState;
}
