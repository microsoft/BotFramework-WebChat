import { WebChatActivity } from '../../types/WebChatActivity';
import isVoiceTranscriptActivity from './isVoiceTranscriptActivity';

const getVoiceActivityText = (activity: WebChatActivity): string | undefined => {
  if (isVoiceTranscriptActivity(activity)) {
    return activity.value.voice?.transcription;
  }
  return undefined;
};

export default getVoiceActivityText;
