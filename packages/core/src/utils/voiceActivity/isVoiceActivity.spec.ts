import isVoiceActivity from './isVoiceActivity';
import { WebChatActivity } from '../../types/WebChatActivity';

// Mock activity factory for testing
const createMockActivity = (type: string = 'event', value?: any): WebChatActivity => ({
  type: type as any,
  id: 'test-activity-id',
  from: { id: 'test-user' },
  channelData: {
    'webchat:sequence-id': 1
  },
  ...(value && { value })
});

const createMockVoiceActivity = (voiceEventType: string, additionalProps?: any): WebChatActivity =>
  createMockActivity('event', {
    voiceLiveEvent: {
      type: voiceEventType,
      ...additionalProps
    }
  });

describe('isVoiceActivity', () => {
  describe('Valid voice activities', () => {
    test('should return true for event activity with voiceLiveEvent', () => {
      const activity = createMockVoiceActivity('response.audio.delta', { delta: 'audiodata' });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for voice activity with minimal voiceLiveEvent', () => {
      const activity = createMockActivity('event', { voiceLiveEvent: {} });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Invalid activities', () => {
    const testCases = [
      // Invalid by activity type
      {
        name: 'message activity with voiceLiveEvent',
        activity: () => createMockActivity('message', { voiceLiveEvent: { type: 'response.audio.delta' } })
      },
      {
        name: 'typing activity',
        activity: () => createMockActivity('typing')
      },
      {
        name: 'event activity with value',
        activity: () => ({ ...createMockActivity('event'), value: 'not an object' })
      }
    ];

    test.each(testCases)('should return false for $name', ({ activity }) => {
      const result = isVoiceActivity(activity());

      expect(result).toBe(false);
    });
  });

  describe('Real-world voice event types', () => {
    const voiceEventTypes = [
      'input_audio_buffer.append',
      'input_audio_buffer.speech_started',
      'input_audio_buffer.speech_stopped',
      'conversation.item.input_audio_transcription.completed',
      'response.audio.delta',
      'response.audio_transcript.delta',
      'response.audio_transcript.done',
      'response.done',
      'session.update',
      'response.cancel'
    ];

    test.each(voiceEventTypes)('should return true for voice event type: %s', eventType => {
      const activity = createMockVoiceActivity(eventType);

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });
});
