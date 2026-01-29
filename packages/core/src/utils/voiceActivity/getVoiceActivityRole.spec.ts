import getVoiceActivityRole from './getVoiceActivityRole';
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
  origin: 'user' | 'agent',
  transcription: string = 'test',
  valueType: string = 'application/vnd.microsoft.activity.azure.directline.audio.transcript'
): WebChatActivity => createMockActivity('event', 'media.end', { transcription, origin }, valueType);

describe('getVoiceActivityRole', () => {
  describe.each([
    ['user', 'user', 'Hello world'],
    ['user', 'user', '']
  ] as const)('Voice transcript activities with origin %s', (expectedRole, origin, transcription) => {
    test(`should return "${expectedRole}" for media.end with origin ${origin}${transcription ? '' : ' and empty transcription'}`, () => {
      const activity = createMockTranscriptActivity(origin, transcription);

      const result = getVoiceActivityRole(activity);

      expect(result).toBe(expectedRole);
    });
  });

  describe.each([
    ['bot', 'agent', 'Hello, how can I help you?'],
    ['bot', 'agent', '']
  ] as const)('Voice transcript activities with origin %s', (expectedRole, origin, transcription) => {
    test(`should return "${expectedRole}" for media.end with origin ${origin}${transcription ? '' : ' and empty transcription'}`, () => {
      const activity = createMockTranscriptActivity(origin, transcription);

      const result = getVoiceActivityRole(activity);

      expect(result).toBe(expectedRole);
    });
  });

  describe('Non-transcript voice activities', () => {
    test.each([
      ['media.chunk', { content: 'base64' }, 'application/vnd.microsoft.activity.azure.directline.audio.chunk'],
      ['request.update', { state: 'detected' }, 'application/vnd.microsoft.activity.azure.directline.audio.state']
    ])('should return undefined for %s', (name, value, valueType) => {
      const activity = createMockVoiceActivity(name, value, valueType);

      const result = getVoiceActivityRole(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Non-voice activities', () => {
    test.each([
      ['message', 'regular message activity'],
      ['typing', 'typing activity']
    ])('should return undefined for %s', type => {
      const activity = createMockActivity(type);

      const result = getVoiceActivityRole(activity);

      expect(result).toBeUndefined();
    });

    test('should return undefined for event activity without audio valueType', () => {
      const activity = createMockActivity('event', 'test', { someOtherData: 'test' }, 'application/json');

      const result = getVoiceActivityRole(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Real-world scenarios', () => {
    test('should correctly identify user transcript in conversation flow', () => {
      const userActivities = [
        createMockVoiceActivity(
          'request.update',
          { state: 'detected' },
          'application/vnd.microsoft.activity.azure.directline.audio.state'
        ),
        createMockVoiceActivity(
          'media.chunk',
          { content: 'base64' },
          'application/vnd.microsoft.activity.azure.directline.audio.chunk'
        ),
        createMockTranscriptActivity('user', 'What is the weather today?')
      ];

      const roles = userActivities.map(activity => getVoiceActivityRole(activity));

      expect(roles).toEqual([undefined, undefined, 'user']);
    });

    test('should correctly identify bot transcript in conversation flow', () => {
      const botActivities = [
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
        createMockTranscriptActivity('agent', 'Today will be sunny with a high of 75 degrees.'),
        createMockVoiceActivity(
          'request.update',
          { state: 'processing' },
          'application/vnd.microsoft.activity.azure.directline.audio.state'
        )
      ];

      const roles = botActivities.map(activity => getVoiceActivityRole(activity));

      expect(roles).toEqual([undefined, undefined, 'bot', undefined]);
    });

    test('should handle mixed activity types in conversation', () => {
      const mixedActivities = [
        createMockActivity('message'),
        createMockTranscriptActivity('user', 'Hello'),
        createMockActivity('typing'),
        createMockTranscriptActivity('agent', 'Hi there!')
      ];

      const roles = mixedActivities.map(activity => getVoiceActivityRole(activity));

      expect(roles).toEqual([undefined, 'user', undefined, 'bot']);
    });
  });
});
