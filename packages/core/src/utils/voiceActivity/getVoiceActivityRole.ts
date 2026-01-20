import { WebChatActivity } from '../../types/WebChatActivity';
import isVoiceTranscriptActivity from './isVoiceTranscriptActivity';

const getVoiceActivityRole = (activity: WebChatActivity): 'user' | 'bot' | undefined => {
  if (isVoiceTranscriptActivity(activity)) {
    if (activity.payload.voice.origin === 'agent') {
      return 'bot';
    }

    if (activity.payload.voice.origin === 'user') {
      return 'user';
    }
  }

  return undefined;
};

export default getVoiceActivityRole;
