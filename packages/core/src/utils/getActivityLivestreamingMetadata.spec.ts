import { type ArraySlice } from 'type-fest';

import { type WebChatActivity } from '../types/WebChatActivity';
import getActivityLivestreamingMetadata from './getActivityLivestreamingMetadata';

function injectInto<T>(
  where: 'channelData' | 'entities',
  metadata: T,
  activity: Partial<WebChatActivity>
): WebChatActivity {
  return {
    ...(where === 'entities' ? { entities: [{ ...metadata, type: 'streaminfo' }] } : { channelData: metadata }),
    ...activity
  } as WebChatActivity;
}

describe.each([['channelData' as const], ['entities' as const]])('using %s', where => {
  let inject: (...args: ArraySlice<Parameters<typeof injectInto>, 1>) => ReturnType<typeof injectInto>;

  beforeEach(() => {
    inject = injectInto.bind(undefined, where);
  });

  describe.each([['with "streamId"' as const], ['without "streamId"' as const]])('activity %s', variant => {
    describe('activity with "streamType" of "streaming"', () => {
      let activity: WebChatActivity;

      beforeEach(() => {
        activity = inject(
          {
            ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
            streamSequence: 1,
            streamType: 'streaming'
          },
          {
            id: 'a-00002',
            text: 'Hello, World!',
            type: 'typing'
          }
        );
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
        activity = inject(
          {
            ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
            streamSequence: 1,
            streamType: 'informative'
          },
          {
            id: 'a-00002',
            text: 'Hello, World!',
            type: 'typing'
          }
        );
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
        activity = inject(
          {
            ...(variant === 'with "streamId"' ? { streamId: 'a-00001' } : {}),
            streamType: 'final'
          },
          {
            id: 'a-00002',
            text: 'Hello, World!',
            type: 'message'
          }
        );
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

  test('activity with "streamType" of "streaming" without critical fields should return undefined', () => {
    expect(
      getActivityLivestreamingMetadata(
        inject(
          {
            streamType: 'streaming'
          },
          {
            type: 'typing'
          }
        )
      )
    ).toBeUndefined();
  });

  test.each([
    ['integer', 1, true],
    ['zero', 0, false],
    ['decimal', 1.234, false]
  ])('activity with %s "streamSequence" should return undefined', (_, streamSequence, isValid) => {
    const activity = inject(
      {
        streamId: 'a-00001',
        streamSequence,
        streamType: 'streaming'
      },
      {
        id: 'a-00002',
        text: '',
        type: 'typing'
      }
    );

    if (isValid) {
      expect(getActivityLivestreamingMetadata(activity)).toBeTruthy();
    } else {
      expect(getActivityLivestreamingMetadata(activity)).toBeUndefined();
    }
  });

  describe('"typing" activity with "streamType" of "final"', () => {
    test('should return undefined if "text" field is defined', () => {
      expect(
        getActivityLivestreamingMetadata(
          inject(
            {
              streamId: 'a-00001',
              streamType: 'final'
            },
            {
              id: 'a-00002',
              text: 'Final "typing" activity, must not have "text".',
              type: 'typing'
            }
          )
        )
      ).toBeUndefined();
    });

    test('should return truthy if "text" field is not defined', () => {
      expect(
        getActivityLivestreamingMetadata(
          inject(
            {
              streamId: 'a-00001',
              streamType: 'final'
            },
            {
              id: 'a-00002',
              // Final activity can be "typing" if it does not have "text".
              type: 'typing'
            }
          )
        )
      ).toHaveProperty('type', 'final activity');
    });
  });

  test('activity with "streamType" of "streaming" without "content" should return type of "contentless"', () => {
    expect(
      getActivityLivestreamingMetadata(
        inject(
          {
            streamSequence: 1,
            streamType: 'streaming'
          },
          {
            id: 'a-00001',
            type: 'typing'
          }
        )
      )
    ).toHaveProperty('type', 'contentless');
  });
});

test('invalid activity should return undefined', () =>
  expect(getActivityLivestreamingMetadata('invalid' as any)).toBeUndefined());
