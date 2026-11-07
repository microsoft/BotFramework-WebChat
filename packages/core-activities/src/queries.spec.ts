/* eslint-disable no-restricted-globals */
import { scenario } from '@testduet/given-when-then';
import createInitialState from './operations/createInitialState';
import receiveActivity from './operations/receiveActivity';
import {
  getActivities,
  getActivityByLocalId,
  getHowToGrouping,
  getLivestreamSession,
  getSortedChatHistory
} from './queries';

scenario('queries', bdd => {
  bdd
    .given('a-1 in HowTo "h1" and the first revision of session "s-1"', () =>
      [
        {
          entities: [
            {
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              isPartOf: { '@id': '_:h1', '@type': 'HowTo' },
              position: 1,
              type: 'https://schema.org/Message'
            }
          ],
          id: 'a-1'
        },
        { channelData: { streamSequence: 1, streamType: 'streaming' }, id: 's-1', type: 'typing' }
      ].reduce(
        (state, extra, index) =>
          receiveActivity(
            state,
            {
              channelData: {},
              from: { id: 'bot', role: 'bot' },
              text: 'Hello',
              timestamp: new Date(index * 1_000).toISOString(),
              type: 'message',
              ...extra
            } as any,
            { Date }
          ),
        createInitialState()
      )
    )
    .when('the state is read', state => state)
    .then('getActivities() should return the transcript', (_, state) =>
      expect(getActivities(state)).toBe(state.sortedActivities)
    )
    .and('getSortedChatHistory() should return the top level', (_, state) =>
      expect(getSortedChatHistory(state).map(({ type }) => type)).toEqual(['how to grouping', 'livestream session'])
    )
    .and('getActivityByLocalId() should return the activity', (_, state) => {
      const [activity] = state.sortedActivities;

      expect(getActivityByLocalId(state, activity?.channelData['webchat:internal:local-id'] as any)).toBe(activity);
      expect(getActivityByLocalId(state, '_:none' as any)).toBeUndefined();
    })
    .and('getHowToGrouping() should return its parts', (_, state) =>
      expect(getHowToGrouping(state, '_:h1' as any)?.partList).toHaveLength(1)
    )
    .and('getLivestreamSession() should return its revisions', (_, state) =>
      expect(getLivestreamSession(state, 's-1' as any)?.activities).toHaveLength(1)
    );
});
