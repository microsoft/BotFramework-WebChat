import isVoiceActivity from './isVoiceActivity';
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

const createMockDtmfActivity = (name: string, dtmfProps: Record<string, any>): WebChatActivity =>
  createMockActivity('event', name, {
    dtmf: dtmfProps
  });

describe('isVoiceActivity', () => {
  describe('Valid voice activities', () => {
    test('should return true for event activity with voice', () => {
      const activity = createMockVoiceActivity('stream.chunk', { contentUrl: 'base64' });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for voice activity with minimal voice', () => {
      const activity = createMockActivity('event', 'stream.chunk', { voice: {} });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for event activity with dtmf', () => {
      const activity = createMockDtmfActivity('dtmf.key', { digit: '1' });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for dtmf activity with minimal dtmf', () => {
      const activity = createMockActivity('event', 'dtmf.key', { dtmf: {} });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Invalid activities', () => {
    const testCases = [
      {
        name: 'message activity with voice',
        activity: () => createMockActivity('message', 'stream.chunk', { voice: { contentUrl: 'base64' } })
      },
      {
        name: 'typing activity',
        activity: () => createMockActivity('typing')
      },
      {
        name: 'event activity with non-object value',
        activity: () => ({ ...createMockActivity('event', 'test'), value: 'not an object' })
      },
      {
        name: 'event activity without voice property',
        activity: () => createMockActivity('event', 'test', { someOtherProp: 'value' })
      },
      {
        name: 'event activity with no value',
        activity: () => createMockActivity('event', 'test')
      },
      {
        name: 'event activity with no name',
        activity: () => createMockActivity('event', undefined, { voice: {} })
      }
    ];

    test.each(testCases)('should return false for $name', ({ activity }) => {
      const result = isVoiceActivity(activity());

      expect(result).toBe(false);
    });
  });

  describe('Real-world voice activity scenarios', () => {
    const voiceScenarios = [
      {
        name: 'session.update with speech detected state',
        eventName: 'session.update',
        voiceProps: { bot_state: 'voice.request.detected', message: 'Your request is identified' }
      },
      {
        name: 'session.update with processing state',
        eventName: 'session.update',
        voiceProps: { bot_state: 'voice.request.processing', message: 'Your request is being processed' }
      },
      {
        name: 'stream.end with user transcription',
        eventName: 'stream.end',
        voiceProps: { transcription: 'My destination is bangalore', origin: 'user' }
      },
      {
        name: 'stream.chunk with server audio response',
        eventName: 'stream.chunk',
        voiceProps: { contentUrl: 'base64chunk' }
      },
      {
        name: 'stream.end with bot transcription',
        eventName: 'stream.end',
        voiceProps: { transcription: 'Your destination is at 1000m above sea level', origin: 'bot' }
      }
    ];

    test.each(voiceScenarios)('should return true for $name', ({ eventName, voiceProps }) => {
      const activity = createMockVoiceActivity(eventName, voiceProps);

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Real-world DTMF activity scenarios', () => {
    const dtmfScenarios = [
      {
        name: 'dtmf.key with digit pressed',
        eventName: 'dtmf.key',
        dtmfProps: { digit: '1' }
      },
      {
        name: 'dtmf.key with star key',
        eventName: 'dtmf.key',
        dtmfProps: { digit: '*' }
      },
      {
        name: 'dtmf.key with hash key',
        eventName: 'dtmf.key',
        dtmfProps: { digit: '#' }
      },
      {
        name: 'dtmf.sequence with multiple digits',
        eventName: 'dtmf.sequence',
        dtmfProps: { sequence: '12345' }
      }
    ];

    test.each(dtmfScenarios)('should return true for $name', ({ eventName, dtmfProps }) => {
      const activity = createMockDtmfActivity(eventName, dtmfProps);

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });
});
