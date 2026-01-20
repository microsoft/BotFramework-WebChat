import isVoiceActivity from './isVoiceActivity';
import { WebChatActivity } from '../../types/WebChatActivity';

const isVoiceTranscriptActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  payload: {
    voice: {
      transcription: string;
      origin: 'user' | 'agent';
    };
  };
} =>
  isVoiceActivity(activity) &&
  activity.name === 'stream.end' &&
  typeof activity?.payload?.voice?.transcription === 'string';

export default isVoiceTranscriptActivity;
