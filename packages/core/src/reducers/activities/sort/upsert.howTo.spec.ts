/* eslint-disable no-restricted-globals */
import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../types/WebChatActivity';
import type { Activity, ActivityMapEntry, HowToGroupingId, HowToGroupingMapEntry, SortedChatHistory } from './types';
import upsert, { INITIAL_STATE } from './upsert';
import { LocalIdSchema, type LocalId } from './property/LocalId';
import { parse } from 'valibot';

type SingularOrPlural<T> = T | readonly T[];

function activityToExpectation(activity: Activity, expectedPosition: number = expect.any(Number) as any): Activity {
  return {
    ...activity,
    channelData: {
      ...activity.channelData,
      'webchat:internal:position': expectedPosition
    } as any
  };
}

function buildActivity(
  activity: { id: string; text: string; timestamp: string },
  messageEntity: { isPartOf: SingularOrPlural<{ '@id': string; '@type': string }>; position: number } | undefined
): WebChatActivity {
  const { id } = activity;

  return {
    channelData: {
      'webchat:internal:local-id': parse(LocalIdSchema, `_:${id}`),
      'webchat:internal:position': 0,
      'webchat:send-status': undefined
    },
    ...(messageEntity
      ? {
          entities: [
            {
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              type: 'https://schema.org/Message',
              ...messageEntity
            } as any
          ]
        }
      : {}),
    from: { id: 'bot', role: 'bot' },
    type: 'message',
    ...activity
  };
}

scenario('upserting plain activity in the same grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 3 }
  );

  const activity3 = buildActivity(
    { id: 'a-00003', text: 'Aloha!', timestamp: new Date(3_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserted', state => upsert({ Date }, state, activity1))
    .then('should have added to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<LocalId, ActivityMapEntry>([
          [
            '_:a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: '_:a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should have added a new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [activityToExpectation(activity1)]);
    })
    .when('upsert another activity into same group', (_, state) => upsert({ Date }, state, activity2))
    .then('should add to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<LocalId, ActivityMapEntry>([
          [
            '_:a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: '_:a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            '_:a-00002' as LocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: '_:a-00002' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should update existing part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 2_000,
              partList: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                },
                {
                  activityLocalId: '_:a-00002' as LocalId,
                  logicalTimestamp: 2_000,
                  position: 3,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('`sortedChatHistoryList` should match', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 2_000, // Should update to 2_000.
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [
        activityToExpectation(activity1),
        activityToExpectation(activity2)
      ]);
    })
    .when('the third activity is upserted', (_, state) => upsert({ Date }, state, activity3))
    .then('should add to `activityMap`', (_, state) => {
      expect(state.activityMap).toEqual(
        new Map<LocalId, ActivityMapEntry>([
          [
            '_:a-00001' as LocalId,
            {
              activity: activityToExpectation(activity1),
              activityLocalId: '_:a-00001' as LocalId,
              logicalTimestamp: 1_000,
              type: 'activity'
            }
          ],
          [
            '_:a-00002' as LocalId,
            {
              activity: activityToExpectation(activity2),
              activityLocalId: '_:a-00002' as LocalId,
              logicalTimestamp: 2_000,
              type: 'activity'
            }
          ],
          [
            '_:a-00003' as LocalId,
            {
              activity: activityToExpectation(activity3),
              activityLocalId: '_:a-00003' as LocalId,
              logicalTimestamp: 3_000,
              type: 'activity'
            }
          ]
        ])
      );
    })
    .and('should update existing part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 3_000,
              partList: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                },
                {
                  activityLocalId: '_:a-00003' as LocalId,
                  logicalTimestamp: 3_000,
                  position: 2,
                  type: 'activity'
                },
                {
                  activityLocalId: '_:a-00002' as LocalId,
                  logicalTimestamp: 2_000,
                  position: 3,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 3_000, // Should not update to 3_000.
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state).toHaveProperty('sortedActivities', [
        activityToExpectation(activity1),
        activityToExpectation(activity3),
        activityToExpectation(activity2)
      ]);
    });
});

scenario('upserting plain activity in two different grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(500).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 1 }
  );

  bdd
    .given('an initial state', () => INITIAL_STATE)
    .when('upserted', state => upsert({ Date }, state, activity1))
    .then('should have added a new part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should have inserted into `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        { logicalTimestamp: 1_000, howToGroupingId: '_:how-to:00001', type: 'how to grouping' }
      ]);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity1, 1_000)]);
    })
    .when('upsert another activity into same group with a former timestamp', (_, state) =>
      upsert({ Date }, state, activity2)
    )
    .then('should update existing part grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 1_000,
              partList: [
                {
                  activityLocalId: '_:a-00001' as LocalId,
                  logicalTimestamp: 1_000,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ],
          [
            '_:how-to:00002' as HowToGroupingId,
            {
              logicalTimestamp: 500,
              partList: [
                {
                  activityLocalId: '_:a-00002' as LocalId,
                  logicalTimestamp: 500,
                  position: 1,
                  type: 'activity'
                }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList` as a separate entry', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        {
          howToGroupingId: '_:how-to:00002' as HowToGroupingId,
          logicalTimestamp: 500,
          type: 'how to grouping'
        },
        {
          howToGroupingId: '_:how-to:00001' as HowToGroupingId,
          logicalTimestamp: 1_000,
          type: 'how to grouping'
        }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should match snapshot', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(activity2, 1),
        activityToExpectation(activity1, 1_000)
      ]);
    });
});

scenario('updating an activity out of its grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  const activity3 = buildActivity(
    { id: 'a-00003', text: 'Bonjour!', timestamp: new Date(3_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 3 }
  );

  // Same ID as activity2, without `isPartOf`.
  const nextActivity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha! (updated)', timestamp: new Date(2_000).toISOString() },
    undefined
  );

  bdd
    .given('3 activities in a grouping', () =>
      [activity1, activity2, activity3].reduce((state, activity) => upsert({ Date }, state, activity), INITIAL_STATE)
    )
    .when('the second activity is updated without `isPartOf`', state => upsert({ Date }, state, nextActivity2))
    .then('should remove it from the grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 3_000,
              partList: [
                { activityLocalId: '_:a-00001' as LocalId, logicalTimestamp: 1_000, position: 1, type: 'activity' },
                { activityLocalId: '_:a-00003' as LocalId, logicalTimestamp: 3_000, position: 3, type: 'activity' }
              ]
            }
          ]
        ])
      );
    })
    .and('should appear in `sortedChatHistoryList` on its own, before the grouping', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        { activityLocalId: '_:a-00002' as LocalId, logicalTimestamp: 2_000, type: 'activity' },
        { howToGroupingId: '_:how-to:00001' as HowToGroupingId, logicalTimestamp: 3_000, type: 'how to grouping' }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should have every activity once', (_, state) => {
      expect(state.sortedActivities).toEqual([
        activityToExpectation(nextActivity2),
        activityToExpectation(activity1),
        activityToExpectation(activity3)
      ]);
    });
});

scenario('updating an activity into another grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 1 }
  );

  // Same ID as activity1, moved to the second grouping.
  const nextActivity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World! (updated)', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00002', '@type': 'HowTo' }], position: 2 }
  );

  bdd
    .given('2 groupings with an activity each', () =>
      [activity1, activity2].reduce((state, activity) => upsert({ Date }, state, activity), INITIAL_STATE)
    )
    .when('the first activity is updated into the second grouping', state => upsert({ Date }, state, nextActivity1))
    .then('should drop the emptied grouping and add it to the second grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00002' as HowToGroupingId,
            {
              logicalTimestamp: 2_000,
              partList: [
                { activityLocalId: '_:a-00002' as LocalId, logicalTimestamp: 2_000, position: 1, type: 'activity' },
                { activityLocalId: '_:a-00001' as LocalId, logicalTimestamp: 1_000, position: 2, type: 'activity' }
              ]
            }
          ]
        ])
      );
    })
    .and('should only have the second grouping in `sortedChatHistoryList`', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        { howToGroupingId: '_:how-to:00002' as HowToGroupingId, logicalTimestamp: 2_000, type: 'how to grouping' }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should have every activity once', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(activity2), activityToExpectation(nextActivity1)]);
    });
});

scenario('updating an activity into a grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    undefined
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  // Same ID as activity1, joining the grouping before activity2.
  const nextActivity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World! (updated)', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  bdd
    .given('an activity and a grouping', () =>
      [activity1, activity2].reduce((state, activity) => upsert({ Date }, state, activity), INITIAL_STATE)
    )
    .when('the activity is updated into the grouping', state => upsert({ Date }, state, nextActivity1))
    .then('should add it to the grouping', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 2_000,
              partList: [
                { activityLocalId: '_:a-00001' as LocalId, logicalTimestamp: 1_000, position: 1, type: 'activity' },
                { activityLocalId: '_:a-00002' as LocalId, logicalTimestamp: 2_000, position: 2, type: 'activity' }
              ]
            }
          ]
        ])
      );
    })
    .and('should no longer appear in `sortedChatHistoryList` on its own', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        { howToGroupingId: '_:how-to:00001' as HowToGroupingId, logicalTimestamp: 2_000, type: 'how to grouping' }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should have every activity once', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(nextActivity1), activityToExpectation(activity2)]);
    });
});

scenario('updating an activity in the same grouping', bdd => {
  const activity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World!', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  const activity2 = buildActivity(
    { id: 'a-00002', text: 'Aloha!', timestamp: new Date(2_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 2 }
  );

  // Same ID and grouping as activity1.
  const nextActivity1 = buildActivity(
    { id: 'a-00001', text: 'Hello, World! (updated)', timestamp: new Date(1_000).toISOString() },
    { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
  );

  bdd
    .given('2 activities in a grouping', () =>
      [activity1, activity2].reduce((state, activity) => upsert({ Date }, state, activity), INITIAL_STATE)
    )
    .when('the first activity is updated', state => upsert({ Date }, state, nextActivity1))
    .then('should keep the grouping as-is', (_, state) => {
      expect(state.howToGroupingMap).toEqual(
        new Map<HowToGroupingId, HowToGroupingMapEntry>([
          [
            '_:how-to:00001' as HowToGroupingId,
            {
              logicalTimestamp: 2_000,
              partList: [
                { activityLocalId: '_:a-00001' as LocalId, logicalTimestamp: 1_000, position: 1, type: 'activity' },
                { activityLocalId: '_:a-00002' as LocalId, logicalTimestamp: 2_000, position: 2, type: 'activity' }
              ]
            }
          ]
        ])
      );
    })
    .and('`sortedChatHistoryList` should have the grouping once', (_, state) => {
      expect(state.sortedChatHistoryList).toEqual([
        { howToGroupingId: '_:how-to:00001' as HowToGroupingId, logicalTimestamp: 2_000, type: 'how to grouping' }
      ] satisfies SortedChatHistory);
    })
    .and('`sortedActivities` should have the updated activity in place', (_, state) => {
      expect(state.sortedActivities).toEqual([activityToExpectation(nextActivity1), activityToExpectation(activity2)]);
    });
});
