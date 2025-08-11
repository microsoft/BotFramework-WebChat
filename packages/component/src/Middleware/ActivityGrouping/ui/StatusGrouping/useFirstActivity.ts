import { type WebChatActivity } from 'botframework-webchat-core';
import useStatusGroupingContext from './private/useStatusGroupingContext';

export default function useFirstActivity(): readonly [WebChatActivity] {
  return useStatusGroupingContext().firstActivityState;
}
