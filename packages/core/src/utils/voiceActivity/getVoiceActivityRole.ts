import { WebChatActivity } from '../../types/WebChatActivity';
import isVoiceTranscriptActivity from './isVoiceTranscriptActivity';

const getVoiceActivityRole = (activity: WebChatActivity): 'bot' | 'user' | undefined => {
  if (isVoiceTranscriptActivity(activity)) {
    if (activity.value.origin === 'agent') {
      return 'bot';
    } else if (activity.value.origin === 'user') {
      return 'user';
    }
  }

  return undefined;
};

export default getVoiceActivityRole;
