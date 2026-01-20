import getVoiceActivityText from './getVoiceActivityText';
import { WebChatActivity } from '../../types/WebChatActivity';

// Mock activity factory for testing
const createMockActivity = (type: string = 'event', name?: string, payload?: any): WebChatActivity => ({
  type: type as any,
  id: 'test-activity-id',
  from: { id: 'test-user' },
  channelData: {
    'webchat:sequence-id': 1
  },
  ...(name && { name }),
  ...(payload && { payload })
});

const createMockVoiceActivity = (name: string, transcription?: string): WebChatActivity =>
  createMockActivity('event', name, {
    voice: {
      ...(transcription !== undefined && { transcription })
    }
  });

describe('getVoiceActivityText', () => {
  describe('Voice transcript activities', () => {
    test.each([
      ['Hello world', 'Hello world'],
      ['How can I help you today?', 'How can I help you today?'],
      ['', '']
    ])('should return %p for stream.end with transcription %p', (expected, transcription) => {
      const activity = createMockVoiceActivity('stream.end', transcription);

      const result = getVoiceActivityText(activity);

      expect(result).toBe(expected);
    });

    test('should return undefined for stream.end without transcript property', () => {
      const activity = createMockVoiceActivity('stream.end');

      const result = getVoiceActivityText(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Non-transcript voice activities', () => {
    test.each([['stream.chunk'], ['session.init']])('should return undefined for %s activity', name => {
      const activity = createMockVoiceActivity(name);

      const result = getVoiceActivityText(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Non-voice activities', () => {
    test.each([
      ['message', undefined, undefined],
      ['event', undefined, { someData: 'test' }]
    ])('should return undefined for %s', (type, name, payload) => {
      const activity = createMockActivity(type, name, payload);

      const result = getVoiceActivityText(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    test('should handle transcript with whitespace only', () => {
      const activity = createMockVoiceActivity('stream.end', '   ');

      const result = getVoiceActivityText(activity);

      expect(result).toBe('   ');
    });

    test('should handle very long transcript', () => {
      const longText = 'A'.repeat(10000);
      const activity = createMockVoiceActivity('stream.end', longText);

      const result = getVoiceActivityText(activity);

      expect(result).toBe(longText);
      expect(result?.length).toBe(10000);
    });
  });
});
