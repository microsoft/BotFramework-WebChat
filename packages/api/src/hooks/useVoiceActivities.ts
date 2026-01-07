import { type WebChatActivity } from 'botframework-webchat-core';
import { useSelector } from './internal/WebChatReduxContext';

export default function useVoiceActivities(): [WebChatActivity[]] {
  return [useSelector(({ voiceActivities }) => voiceActivities)];
}
