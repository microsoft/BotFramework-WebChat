import isVoiceActivity from './isVoiceActivity';
import { WebChatActivity } from '../../types/WebChatActivity';

const isVoiceTranscriptActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  value: {
    voice: {
      transcription: string;
      origin: 'user' | 'bot';
    };
  };
} =>
  isVoiceActivity(activity) &&
  activity.name === 'stream.end' &&
  typeof activity.value?.voice?.transcription === 'string';

export default isVoiceTranscriptActivity;
