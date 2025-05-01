import { type WebChatActivity } from 'botframework-webchat-core';
import useSenderGroupingContext from './private/useSenderGroupingContext';

export default function useFirstActivity(): readonly [WebChatActivity] {
  return useSenderGroupingContext().firstActivityState;
}
