import isVoiceTranscriptActivity from './isVoiceTranscriptActivity';
import { WebChatActivity } from '../../types/WebChatActivity';

// Mock activity factory for testing
const createMockActivity = (type: string = 'event', name?: string, value?: any, valueType?: string): WebChatActivity =>
  ({
    type: type as any,
    id: 'test-activity-id',
    from: { id: 'test-user' },
    channelData: {
      'webchat:sequence-id': 1
    },
    ...(name && { name }),
    ...(value && { value }),
    ...(valueType && { valueType })
  }) as WebChatActivity;

const createMockVoiceActivity = (
  name: string,
  value: Record<string, any>,
  valueType: string = 'application/vnd.microsoft.activity.azure.directline.audio.chunk'
): WebChatActivity => createMockActivity('event', name, value, valueType);

const createMockTranscriptActivity = (
  transcription: string,
  origin: 'user' | 'agent',
  valueType: string = 'application/vnd.microsoft.activity.azure.directline.audio.transcript'
): WebChatActivity => createMockActivity('event', 'media.end', { transcription, origin }, valueType);

describe('isVoiceTranscriptActivity', () => {
  describe('Valid transcript activities', () => {
    test('should return true for media.end with user transcription', () => {
      const activity = createMockTranscriptActivity('Hello world', 'user');

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for media.end with agent transcription', () => {
      const activity = createMockTranscriptActivity('Hi there!', 'agent');

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for media.end with empty transcription string', () => {
      const activity = createMockTranscriptActivity('', 'user');

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for ccv2 transcript valueType', () => {
      const activity = createMockTranscriptActivity(
        'Test transcript',
        'user',
        'application/vnd.microsoft.activity.ccv2.audio.transcript'
      );

      const result = isVoiceTranscriptActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Invalid activities', () => {
    const testCases = [
      {
        name: 'media.chunk voice activity',
        activity: () =>
          createMockVoiceActivity(
            'media.chunk',
            { content: 'base64' },
            'application/vnd.microsoft.activity.azure.directline.audio.chunk'
          )
      },
      {
        name: 'request.update voice activity',
        activity: () =>
          createMockVoiceActivity(
            'request.update',
            { state: 'detected' },
            'application/vnd.microsoft.activity.azure.directline.audio.state'
          )
      },
      {
        name: 'media.end without transcription',
        activity: () =>
          createMockActivity(
            'event',
            'media.end',
            { origin: 'user' },
            'application/vnd.microsoft.activity.azure.directline.audio.transcript'
          )
      },
      {
        name: 'media.end with non-string transcription',
        activity: () =>
          createMockActivity(
            'event',
            'media.end',
            { transcription: 123, origin: 'user' },
            'application/vnd.microsoft.activity.azure.directline.audio.transcript'
          )
      },
      {
        name: 'media.end with null transcription',
        activity: () =>
          createMockActivity(
            'event',
            'media.end',
            { transcription: null, origin: 'user' },
            'application/vnd.microsoft.activity.azure.directline.audio.transcript'
          )
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
        name: 'media.end with non-transcript valueType',
        activity: () =>
          createMockActivity(
            'event',
            'media.end',
            { transcription: 'test', origin: 'user' },
            'application/vnd.microsoft.activity.azure.directline.audio.chunk'
          )
      },
      {
        name: 'event activity without valueType',
        activity: () => createMockActivity('event', 'media.end', { transcription: 'test', origin: 'user' })
      },
      {
        name: 'event activity without name',
        activity: () =>
          createMockActivity(
            'event',
            undefined,
            { transcription: 'test', origin: 'user' },
            'application/vnd.microsoft.activity.azure.directline.audio.transcript'
          )
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
        createMockVoiceActivity(
          'request.update',
          { state: 'detected' },
          'application/vnd.microsoft.activity.azure.directline.audio.state'
        ),
        createMockVoiceActivity(
          'request.update',
          { state: 'processing' },
          'application/vnd.microsoft.activity.azure.directline.audio.state'
        ),
        createMockTranscriptActivity('What is the weather today?', 'user')
      ];

      const transcriptResults = conversationActivities.map(activity => isVoiceTranscriptActivity(activity));

      expect(transcriptResults).toEqual([false, false, true]);
    });

    test('should identify agent transcript in response flow', () => {
      const responseActivities = [
        createMockVoiceActivity(
          'request.update',
          { state: 'response.available' },
          'application/vnd.microsoft.activity.azure.directline.audio.state'
        ),
        createMockVoiceActivity(
          'media.chunk',
          { content: 'chunk1' },
          'application/vnd.microsoft.activity.azure.directline.audio.chunk'
        ),
        createMockVoiceActivity(
          'media.chunk',
          { content: 'chunk2' },
          'application/vnd.microsoft.activity.azure.directline.audio.chunk'
        ),
        createMockTranscriptActivity('Today will be sunny with a high of 75 degrees.', 'agent')
      ];

      const transcriptResults = responseActivities.map(activity => isVoiceTranscriptActivity(activity));

      expect(transcriptResults).toEqual([false, false, false, true]);
    });

    test('should handle complete conversation with mixed activities', () => {
      const mixedActivities = [
        createMockActivity('message', 'test'),
        createMockTranscriptActivity('Hello', 'user'),
        createMockVoiceActivity(
          'media.chunk',
          { content: 'audio' },
          'application/vnd.microsoft.activity.azure.directline.audio.chunk'
        ),
        createMockTranscriptActivity('Hi there!', 'agent'),
        createMockActivity('typing')
      ];

      const transcriptResults = mixedActivities.map(activity => isVoiceTranscriptActivity(activity));

      expect(transcriptResults).toEqual([false, true, false, true, false]);
    });
  });
});
