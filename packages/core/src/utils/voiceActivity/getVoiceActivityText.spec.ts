import getVoiceActivityText from './getVoiceActivityText';
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

const createMockTranscriptActivity = (
  transcription: string | undefined,
  origin: 'user' | 'agent' = 'user',
  valueType: string = 'application/vnd.microsoft.activity.azure.directline.audio.transcript'
): WebChatActivity =>
  createMockActivity(
    'event',
    'media.end',
    transcription !== undefined ? { transcription, origin } : { origin },
    valueType
  );

describe('getVoiceActivityText', () => {
  describe('Voice transcript activities', () => {
    test.each([
      ['Hello world', 'Hello world'],
      ['How can I help you today?', 'How can I help you today?'],
      ['', '']
    ])('should return %p for media.end with transcription %p', (expected, transcription) => {
      const activity = createMockTranscriptActivity(transcription);

      const result = getVoiceActivityText(activity);

      expect(result).toBe(expected);
    });

    test('should return undefined for media.end without transcript property', () => {
      const activity = createMockTranscriptActivity(undefined);

      const result = getVoiceActivityText(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Non-transcript voice activities', () => {
    test.each([['media.chunk'], ['request.update']])('should return undefined for %s activity', name => {
      const activity = createMockActivity(
        'event',
        name,
        { content: 'base64' },
        'application/vnd.microsoft.activity.azure.directline.audio.chunk'
      );

      const result = getVoiceActivityText(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Non-voice activities', () => {
    test.each([
      ['message', undefined, undefined, undefined],
      ['event', undefined, { someData: 'test' }, undefined]
    ])('should return undefined for %s', (type, name, value, valueType) => {
      const activity = createMockActivity(type, name, value, valueType);

      const result = getVoiceActivityText(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    test('should handle transcript with whitespace only', () => {
      const activity = createMockTranscriptActivity('   ');

      const result = getVoiceActivityText(activity);

      expect(result).toBe('   ');
    });

    test('should handle very long transcript', () => {
      const longText = 'A'.repeat(10000);
      const activity = createMockTranscriptActivity(longText);

      const result = getVoiceActivityText(activity);

      expect(result).toBe(longText);
      expect(result?.length).toBe(10000);
    });
  });
});
