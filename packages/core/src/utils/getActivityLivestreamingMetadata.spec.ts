import type { WebChatActivity } from '../types/WebChatActivity';
import getActivityLivestreamingMetadata from './getActivityLivestreamingMetadata';

describe.each([['with "streamId"' as const], ['without "streamId"' as const]])('activity %s', variant => {
  describe('activity with "streamType" of "streaming" (channelData)', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        channelData: {
          ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
          streamSequence: 1,
          streamType: 'streaming'
        },
        id: 'a-00002',
        text: 'Hello, World!',
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

  describe('activity with "streamType" of "informative message" (channelData)', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        channelData: {
          ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
          streamSequence: 1,
          streamType: 'informative'
        },
        id: 'a-00002',
        text: 'Hello, World!',
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

  describe('activity with "streamType" of "final" (channelData)', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        channelData: {
          ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
          streamType: 'final'
        },
        id: 'a-00002',
        text: 'Hello, World!',
        type: 'message'
      } as any;
    });

    if (variant === 'with "streamId"') {
      test('should return type of "final activity"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'final activity'));
      test('should return sequence number of Infinity', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', Infinity));
      test('should return session ID', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00001'));
    } else {
      // Final activity must have "streamId". Final activity without "streamId" is not a valid livestream activity.
      test('should return undefined', () => expect(getActivityLivestreamingMetadata(activity)).toBeUndefined());
    }
  });
});

describe.each([['with "streamId"' as const], ['without "streamId"' as const]])('activity %s', variant => {
  describe('activity with "streamType" of "streaming" (entities)', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        entities: [
          {
            ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
            streamSequence: 1,
            streamType: 'streaming',
            type: 'streaminfo'
          }
        ],
        channelData: {},
        id: 'a-00002',
        text: 'Hello, World!',
        type: 'typing'
      } as any;
    });

    test('should return type of "interim activity"', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'interim activity'));
    test('should return sequence number', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', 1));

    if (variant === 'with "streamId"') {
      test('should return session ID with value from "entities.streamId"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00001'));
    } else {
      test('should return session ID with value of "activity.id"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00002'));
    }
  });

  describe('activity with "streamType" of "informative message" (entities)', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        entities: [
          {
            ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
            streamSequence: 1,
            streamType: 'informative',
            type: 'streaminfo'
          }
        ],
        channelData: {},
        id: 'a-00002',
        text: 'Hello, World!',
        type: 'typing'
      } as any;
    });

    test('should return type of "informative message"', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'informative message'));
    test('should return sequence number', () =>
      expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', 1));

    if (variant === 'with "streamId"') {
      test('should return session ID with value from "entities.streamId"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00001'));
    } else {
      test('should return session ID with value of "activity.id"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sessionId', 'a-00002'));
    }
  });

  describe('activity with "streamType" of "final" (entities)', () => {
    let activity: WebChatActivity;

    beforeEach(() => {
      activity = {
        entities: [
          {
            ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
            streamType: 'final',
            type: 'streaminfo'
          }
        ],
        channelData: {},
        id: 'a-00002',
        text: 'Hello, World!',
        type: 'message'
      } as any;
    });

    if (variant === 'with "streamId"') {
      test('should return type of "final activity"', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('type', 'final activity'));
      test('should return sequence number of Infinity', () =>
        expect(getActivityLivestreamingMetadata(activity)).toHaveProperty('sequenceNumber', Infinity));
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

test('activity with "streamType" of "streaming" without critical fields should return undefined (channelData)', () =>
  expect(
    getActivityLivestreamingMetadata({
      channelData: { streamType: 'streaming' },
      type: 'typing'
    } as any)
  ).toBeUndefined());

test('activity with "streamType" of "streaming" without critical fields should return undefined (entities)', () =>
  expect(
    getActivityLivestreamingMetadata({
      entities: [{ streamType: 'streaming', type: 'streaminfo' }],
      channelData: {},
      type: 'typing'
    } as any)
  ).toBeUndefined());

describe.each([
  ['integer', 1, true],
  ['zero', 0, false],
  ['decimal', 1.234, false]
])('activity with %s "streamSequence" should return undefined (channelData)', (_, streamSequence, isValid) => {
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

describe.each([
  ['integer', 1, true],
  ['zero', 0, false],
  ['decimal', 1.234, false]
])('activity with %s "streamSequence" should return undefined (entities)', (_, streamSequence, isValid) => {
  const activity = {
    entities: [{ streamSequence, streamType: 'streaming', type: 'streaminfo' }],
    channelData: {},
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

describe('"typing" activity with "streamType" of "final" (channelData)', () => {
  test('should return undefined if "text" field is defined', () =>
    expect(
      getActivityLivestreamingMetadata({
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00002',
        text: 'Final "typing" activity, must not have "text".',
        type: 'typing'
      } as any)
    ).toBeUndefined());

  test('should return truthy if "text" field is not defined', () =>
    expect(
      getActivityLivestreamingMetadata({
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00002',
        // Final activity can be "typing" if it does not have "text".
        type: 'typing'
      } as any)
    ).toHaveProperty('type', 'final activity'));
});

describe('"typing" activity with "streamType" of "final" (entities)', () => {
  test('should return undefined if "text" field is defined', () =>
    expect(
      getActivityLivestreamingMetadata({
        entities: [{ streamId: 'a-00001', streamType: 'final', type: 'streaminfo' }],
        channelData: {},
        id: 'a-00002',
        text: 'Final "typing" activity, must not have "text".',
        type: 'typing'
      } as any)
    ).toBeUndefined());

  test('should return truthy if "text" field is not defined', () =>
    expect(
      getActivityLivestreamingMetadata({
        entities: [{ streamId: 'a-00001', streamType: 'final', type: 'streaminfo' }],
        channelData: {},
        id: 'a-00002',
        // Final activity can be "typing" if it does not have "text".
        type: 'typing'
      } as any)
    ).toHaveProperty('type', 'final activity'));
});

test('activity with "streamType" of "streaming" without "content" should return type of "contentless" (channelData)', () =>
  expect(
    getActivityLivestreamingMetadata({
      channelData: { streamSequence: 1, streamType: 'streaming' },
      id: 'a-00001',
      type: 'typing'
    } as any)
  ).toHaveProperty('type', 'contentless'));

test('activity with "streamType" of "streaming" without "content" should return type of "contentless" (entities)', () =>
  expect(
    getActivityLivestreamingMetadata({
      entities: [{ streamSequence: 1, streamType: 'streaming', type: 'streaminfo' }],
      channelData: {},
      id: 'a-00001',
      type: 'typing'
    } as any)
  ).toHaveProperty('type', 'contentless'));
