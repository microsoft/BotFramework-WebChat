import getVoiceActivityRole from './getVoiceActivityRole';
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

const createMockVoiceActivity = (name: string, origin?: 'user' | 'agent', transcription?: string): WebChatActivity =>
  createMockActivity('event', name, {
    voice: {
      ...(origin && { origin }),
      ...(transcription !== undefined && { transcription })
    }
  });

describe('getVoiceActivityRole', () => {
  describe.each([
    ['user', 'user', 'Hello world'],
    ['user', 'user', '']
  ] as const)('Voice transcript activities with origin %s', (expectedRole, origin, transcription) => {
    test(`should return "${expectedRole}" for stream.end with origin ${origin}${transcription ? '' : ' and empty transcription'}`, () => {
      const activity = createMockVoiceActivity('stream.end', origin, transcription);

      const result = getVoiceActivityRole(activity);

      expect(result).toBe(expectedRole);
    });
  });

  describe.each([
    ['bot', 'agent', 'Hello, how can I help you?'],
    ['bot', 'agent', '']
  ] as const)('Voice transcript activities with origin %s', (expectedRole, origin, transcription) => {
    test(`should return "${expectedRole}" for stream.end with origin ${origin}${transcription ? '' : ' and empty transcription'}`, () => {
      const activity = createMockVoiceActivity('stream.end', origin, transcription);

      const result = getVoiceActivityRole(activity);

      expect(result).toBe(expectedRole);
    });
  });

  describe('Non-transcript voice activities', () => {
    test.each([
      ['stream.chunk', undefined, undefined],
      ['stream.end', undefined, 'Some text']
    ])('should return undefined for %s', (name, origin, transcription) => {
      const activity = createMockVoiceActivity(name, origin, transcription);

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

    test('should return undefined for event activity without voice data', () => {
      const activity = createMockActivity('event', undefined, {
        someOtherData: 'test'
      });

      const result = getVoiceActivityRole(activity);

      expect(result).toBeUndefined();
    });
  });

  describe('Real-world scenarios', () => {
    test('should correctly identify user transcript in conversation flow', () => {
      const userActivities = [
        createMockVoiceActivity('stream.start'),
        createMockVoiceActivity('stream.chunk'),
        createMockVoiceActivity('stream.end', 'user', 'What is the weather today?')
      ];

      const roles = userActivities.map(activity => getVoiceActivityRole(activity));

      expect(roles).toEqual([undefined, undefined, 'user']);
    });

    test('should correctly identify bot transcript in conversation flow', () => {
      const botActivities = [
        createMockVoiceActivity('stream.chunk'),
        createMockVoiceActivity('stream.chunk'),
        createMockVoiceActivity('stream.end', 'agent', 'Today will be sunny with a high of 75 degrees.'),
        createMockVoiceActivity('session.update')
      ];

      const roles = botActivities.map(activity => getVoiceActivityRole(activity));

      expect(roles).toEqual([undefined, undefined, 'bot', undefined]);
    });

    test('should handle mixed activity types in conversation', () => {
      const mixedActivities = [
        createMockActivity('message'),
        createMockVoiceActivity('stream.end', 'user', 'Hello'),
        createMockActivity('typing'),
        createMockVoiceActivity('stream.end', 'agent', 'Hi there!')
      ];

      const roles = mixedActivities.map(activity => getVoiceActivityRole(activity));

      expect(roles).toEqual([undefined, 'user', undefined, 'bot']);
    });
  });
});
