import isVoiceActivity from './isVoiceActivity';
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

const createMockDtmfActivity = (name: string, value: Record<string, any>): WebChatActivity =>
  createMockActivity('event', name, value, 'application/vnd.microsoft.activity.ccv2.dtmf');

describe('isVoiceActivity', () => {
  describe('Valid voice activities', () => {
    test('should return true for event activity with azure directline audio valueType', () => {
      const activity = createMockVoiceActivity(
        'media.chunk',
        { content: 'base64', contentType: 'audio/webm' },
        'application/vnd.microsoft.activity.azure.directline.audio.chunk'
      );

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for event activity with ccv2 audio valueType', () => {
      const activity = createMockVoiceActivity(
        'media.chunk',
        { content: 'base64' },
        'application/vnd.microsoft.activity.ccv2.audio.chunk'
      );

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for event activity with dtmf valueType', () => {
      const activity = createMockDtmfActivity('media.end', { key: '1' });

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });

    test('should return true for request.update with audio.state valueType', () => {
      const activity = createMockVoiceActivity(
        'request.update',
        { state: 'detected', message: 'Your request is identified' },
        'application/vnd.microsoft.activity.azure.directline.audio.state'
      );

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Invalid activities', () => {
    const testCases = [
      {
        name: 'message activity with audio valueType',
        activity: () =>
          createMockActivity(
            'message',
            'media.chunk',
            { content: 'base64' },
            'application/vnd.microsoft.activity.azure.directline.audio.chunk'
          )
      },
      {
        name: 'typing activity',
        activity: () => createMockActivity('typing')
      },
      {
        name: 'event activity with non-audio valueType',
        activity: () => createMockActivity('event', 'test', { data: 'test' }, 'application/json')
      },
      {
        name: 'event activity without valueType',
        activity: () => createMockActivity('event', 'test', { someData: 'value' })
      },
      {
        name: 'event activity with no value',
        activity: () =>
          createMockActivity(
            'event',
            'test',
            undefined,
            'application/vnd.microsoft.activity.azure.directline.audio.chunk'
          )
      },
      {
        name: 'event activity with no name',
        activity: () =>
          createMockActivity(
            'event',
            undefined,
            { data: 'test' },
            'application/vnd.microsoft.activity.azure.directline.audio.chunk'
          )
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
        name: 'request.update with speech detected state',
        eventName: 'request.update',
        value: { state: 'detected', message: 'Your request is identified' },
        valueType: 'application/vnd.microsoft.activity.azure.directline.audio.state'
      },
      {
        name: 'request.update with processing state',
        eventName: 'request.update',
        value: { state: 'processing', message: 'Your request is being processed' },
        valueType: 'application/vnd.microsoft.activity.azure.directline.audio.state'
      },
      {
        name: 'media.end with user transcription',
        eventName: 'media.end',
        value: { transcription: 'My destination is bangalore', origin: 'user' },
        valueType: 'application/vnd.microsoft.activity.azure.directline.audio.transcript'
      },
      {
        name: 'media.chunk with server audio response',
        eventName: 'media.chunk',
        value: { content: 'base64chunk', contentType: 'audio/webm' },
        valueType: 'application/vnd.microsoft.activity.azure.directline.audio.chunk'
      },
      {
        name: 'media.end with bot transcription',
        eventName: 'media.end',
        value: { transcription: 'Your destination is at 1000m above sea level', origin: 'agent' },
        valueType: 'application/vnd.microsoft.activity.azure.directline.audio.transcript'
      }
    ];

    test.each(voiceScenarios)('should return true for $name', ({ eventName, value, valueType }) => {
      const activity = createMockVoiceActivity(eventName, value, valueType);

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });

  describe('Real-world DTMF activity scenarios', () => {
    const dtmfScenarios = [
      {
        name: 'DTMF with digit 1',
        eventName: 'media.end',
        value: { key: '1' }
      },
      {
        name: 'DTMF with star key',
        eventName: 'media.end',
        value: { key: '*' }
      },
      {
        name: 'DTMF with hash key',
        eventName: 'media.end',
        value: { key: '#' }
      },
      {
        name: 'DTMF with digit 5',
        eventName: 'media.end',
        value: { key: '5' }
      }
    ];

    test.each(dtmfScenarios)('should return true for $name', ({ eventName, value }) => {
      const activity = createMockDtmfActivity(eventName, value);

      const result = isVoiceActivity(activity);

      expect(result).toBe(true);
    });
  });
});
