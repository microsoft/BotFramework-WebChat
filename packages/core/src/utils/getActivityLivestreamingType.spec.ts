import type { WebChatActivity } from '../types/WebChatActivity';
import getActivityLivestreamingType from './getActivityLivestreamingType';

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
        text: '',
        type: 'typing'
      } as any;
    });

    test('should return "interim activity"', () =>
      expect(getActivityLivestreamingType(activity)).toBe('interim activity'));
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
        text: '',
        type: 'typing'
      } as any;
    });

    test('should return "informative message"', () =>
      expect(getActivityLivestreamingType(activity)).toBe('informative message'));
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
        text: '',
        type: 'message'
      } as any;
    });

    if (variant === 'with "streamId"') {
      test('should return "final activity"', () =>
        expect(getActivityLivestreamingType(activity)).toBe('final activity'));
    } else {
      // Final activity must have "streamId". Final activity without "streamId" is not a valid livestream activity.
      test('should return undefined', () => expect(getActivityLivestreamingType(activity)).toBeUndefined());
    }
  });
});

test('invalid activity should return undefined', () =>
  expect(getActivityLivestreamingType('invalid' as any)).toBeUndefined());

test('activity with "streamType" of "streaming" without critical fields should return undefined', () =>
  expect(
    getActivityLivestreamingType({
      channelData: { streamType: 'streaming' },
      type: 'typing'
    } as any)
  ).toBeUndefined());

test('activity with "streamType" of "final" but "type" of "typing" should return undefined', () =>
  expect(
    getActivityLivestreamingType({
      channelData: { streamType: 'final' },
      text: '',
      // Final activity must be "message", not "typing".
      type: 'typing'
    } as any)
  ).toBeUndefined());
