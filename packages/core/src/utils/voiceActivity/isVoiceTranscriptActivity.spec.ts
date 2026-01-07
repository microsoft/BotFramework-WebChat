import isVoiceTranscriptActivity from './isVoiceTranscriptActivity';
import { WebChatActivity } from '../../types/WebChatActivity';

// Mock activity factory for testing
const createMockActivity = (type: string = 'event', name?: string, value?: any): WebChatActivity => ({
  type: type as any,
  id: 'test-activity-id',
  from: { id: 'test-user' },
  channelData: {
    'webchat:sequence-id': 1
  },
  ...(name && { name }),
  ...(value && { value })
});

const createMockVoiceActivity = (name: string, voiceProps: Record<string, any>): WebChatActivity =>
  createMockActivity('event', name, {
    voice: voiceProps
  });

describe('isVoiceTranscriptActivity', () => {
  describe('Valid transcript activities', () => {
    test('should return true for stream.end with user transcription', () => {
      const activity = createMockVoiceActivity('stream.end', {
        transcription: 'Hello world',
        origin: 'user'
      });

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for stream.end with bot transcription', () => {
      const activity = createMockVoiceActivity('stream.end', {
        transcription: 'Hi there!',
        origin: 'bot'
      });

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for stream.end with empty transcription string', () => {
      const activity = createMockVoiceActivity('stream.end', {
        transcription: '',
        origin: 'user'
      });

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Invalid activities', () => {
    const testCases = [
      {
        name: 'stream.chunk voice activity',
        activity: () => createMockVoiceActivity('stream.chunk', { contentUrl: 'base64' })
      },
      {
        name: 'session.update voice activity',
        activity: () => createMockVoiceActivity('session.update', { bot_state: 'voice.request.detected' })
      },
      {
        name: 'stream.end without transcription',
        activity: () => createMockVoiceActivity('stream.end', { origin: 'user' })
      },
      {
        name: 'stream.end with non-string transcription',
        activity: () => createMockVoiceActivity('stream.end', { transcription: 123, origin: 'user' })
      },
      {
        name: 'stream.end with null transcription',
        activity: () => createMockVoiceActivity('stream.end', { transcription: null, origin: 'user' })
      },
      {
        name: 'regular message activity',
        activity: () => createMockActivity('message', 'test')
      },
      {
        name: 'typing activity',
        activity: () => createMockActivity('typing')
      },
      {
        name: 'event activity without voice data',
        activity: () => createMockActivity('event', 'stream.end', { someData: 'test' })
      },
      {
        name: 'event activity with null value',
        activity: () => ({ ...createMockActivity('event', 'stream.end'), value: null })
      },
      {
        name: 'event activity without value',
        activity: () => createMockActivity('event', 'stream.end')
      },
      {
        name: 'event activity without name',
        activity: () => createMockActivity('event', undefined, { voice: { transcription: 'test' } })
      }
    ];

    test.each(testCases)('should return false for $name', ({ activity }) => {
      const result = isVoiceTranscriptActivity(activity());

      expect(result).toBe(false);
    });
  });

  describe('Real-world scenarios', () => {
    test('should identify user transcript in conversation flow', () => {
      const conversationActivities = [
        createMockVoiceActivity('session.update', { bot_state: 'voice.request.detected' }),
        createMockVoiceActivity('session.update', { bot_state: 'voice.request.processing' }),
        createMockVoiceActivity('stream.end', {
          transcription: 'What is the weather today?',
          origin: 'user'
        })
      ];

      const transcriptResults = conversationActivities.map(activity => isVoiceTranscriptActivity(activity));

      expect(transcriptResults).toEqual([false, false, true]);
    });

    test('should identify bot transcript in response flow', () => {
      const responseActivities = [
        createMockVoiceActivity('session.update', { bot_state: 'voice.response.available' }),
        createMockVoiceActivity('stream.chunk', { contentUrl: 'chunk1' }),
        createMockVoiceActivity('stream.chunk', { contentUrl: 'chunk2' }),
        createMockVoiceActivity('stream.end', {
          transcription: 'Today will be sunny with a high of 75 degrees.',
          origin: 'bot'
        })
      ];

      const transcriptResults = responseActivities.map(activity => isVoiceTranscriptActivity(activity));

      expect(transcriptResults).toEqual([false, false, false, true]);
    });

    test('should handle complete conversation with mixed activities', () => {
      const mixedActivities = [
        createMockActivity('message', 'test'),
        createMockVoiceActivity('stream.end', {
          transcription: 'Hello',
          origin: 'user'
        }),
        createMockVoiceActivity('stream.chunk', { contentUrl: 'audio' }),
        createMockVoiceActivity('stream.end', {
          transcription: 'Hi there!',
          origin: 'bot'
        }),
        createMockActivity('typing')
      ];

      const transcriptResults = mixedActivities.map(activity => isVoiceTranscriptActivity(activity));

      expect(transcriptResults).toEqual([false, true, false, true, false]);
    });
  });
});
