import { WebChatActivity } from '../../types/WebChatActivity';
import isVoiceTranscriptActivity from './isVoiceTranscriptActivity';

const getVoiceActivityRole = (activity: WebChatActivity): 'user' | 'bot' | undefined => {
  if (isVoiceTranscriptActivity(activity)) {
    if (activity.value.voice.origin === 'agent') {
      return 'bot';
    }

    if (activity.value.voice.origin === 'user') {
      return 'user';
    }
  }

  return undefined;
};

export default getVoiceActivityRole;
