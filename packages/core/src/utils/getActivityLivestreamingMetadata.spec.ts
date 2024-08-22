import type { WebChatActivity } from '../types/WebChatActivity';
import getActivityLivestreamingMetadata from './getActivityLivestreamingMetadata';

describe.each([['with "streamId"' as const], ['without "streamId"' as const]])('activity %s', variant => {
  describe('activity with "streamType" of "streaming"', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        channelData: {
          ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
          streamSequence: 1,
          streamType: 'streaming'
        },
        id: 'a-00002',
        text: '',
        type: 'typing'
      } as any;
    });

    test('should return type of "interim activity"', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'interim activity'));
    test('should return sequence number', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', 1));

    if (variant === 'with "streamId"') {
      test('should return session ID with value from "channelData.streamId"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00001'));
    } else {
      test('should return session ID with value of "activity.id"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00002'));
    }
  });

  describe('activity with "streamType" of "informative message"', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        channelData: {
          ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
          streamSequence: 1,
          streamType: 'informative'
        },
        id: 'a-00002',
        text: '',
        type: 'typing'
      } as any;
    });

    test('should return type of "informative message"', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'informative message'));
    test('should return sequence number', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', 1));

    if (variant === 'with "streamId"') {
      test('should return session ID with value from "channelData.streamId"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00001'));
    } else {
      test('should return session ID with value of "activity.id"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00002'));
    }
  });

  describe('activity with "streamType" of "final"', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        channelData: {
          ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
          streamSequence: 1,
          streamType: 'final'
        },
        id: 'a-00002',
        text: '',
        type: 'message'
      } as any;
    });

    if (variant === 'with "streamId"') {
      test('should return type of "final activity"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'final activity'));
      test('should return sequence number', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', 1));
      test('should return session ID', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00001'));
    } else {
      // Final activity must have "streamId". Final activity without "streamId" is not a valid livestream activity.
      test('should return undefined', () => expect(getActivityLivestreamingMetadata(activity)).toBeUndefined());
    }
  });
});

test('invalid activity should return undefined', () =>
  expect(getActivityLivestreamingMetadata('invalid' as any)).toBeUndefined());

test('activity with "streamType" of "streaming" without critical fields should return undefined', () =>
  expect(
    getActivityLivestreamingMetadata({
      channelData: { streamType: 'streaming' },
      type: 'typing'
    } as any)
  ).toBeUndefined());

describe.each([
  ['integer', 1, true],
  ['zero', 0, false],
  // eslint-disable-next-line no-magic-numbers
  ['decimal', 1.234, false]
])('activity with %s "streamSequence" should return undefined', (_, streamSequence, isValid) => {
  const activity = {
    channelData: { streamSequence, streamType: 'streaming' },
    id: 'a-00001',
    text: '',
    type: 'typing'
  } as any;

  if (isValid) {
    expect(getActivityLivestreamingMetadata(activity)).toBeTruthy();
  } else {
    expect(getActivityLivestreamingMetadata(activity)).toBeUndefined();
  }
});

test('activity with "streamType" of "final" but "type" of "typing" should return undefined', () =>
  expect(
    getActivityLivestreamingMetadata({
      channelData: { streamType: 'final' },
      text: '',
      // Final activity must be "message", not "typing".
      type: 'typing'
    } as any)
  ).toBeUndefined());
