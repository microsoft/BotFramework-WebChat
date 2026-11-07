/* eslint-disable no-restricted-globals */
// A store transaction that throws: the graph and the state from before it are kept (moved from core's reducer spec,
// which cannot spy on this package's modules once core bundles it).
import { scenario } from '@testduet/given-when-then';
import { generateLocalIdInActivity, setLocalIdInActivity } from '../property/LocalId';
import type { Activity, State } from '../types';
import upsert, { INITIAL_STATE } from '../upsert';
import * as toJSONValueModule from './private/toJSONValue';

const ponyfill = { Date };

function botActivity(id: string, text: string, timestamp: number, groupingId?: string): Activity {
  return {
    channelData: {},
    ...(groupingId && {
      entities: [
        {
          '@context': 'https://schema.org',
          '@id': '',
          '@type': 'Message',
          isPartOf: { '@id': groupingId, '@type': 'HowTo' },
          position: 1,
          type: 'https://schema.org/Message'
        }
      ]
    }),
    from: { id: 'bot', role: 'bot' },
    id,
    text,
    timestamp: new Date(timestamp).toISOString(),
    type: 'message'
  } as any;
}

// As an incoming activity: a known ID keeps its local ID.
function receive(state: State, activity: Activity): State {
  const localId = state.activityIdToLocalIdMap.get(activity.id ?? '');

  return upsert(
    ponyfill,
    state,
    localId ? setLocalIdInActivity(activity, localId) : generateLocalIdInActivity(activity)
  );
}

const texts = (state: State) => state.sortedActivities.map(({ text }) => text);

scenario('a transaction that throws', bdd => {
  bdd
    .given('a-1 in HowTo "h1"', () => receive(INITIAL_STATE, botActivity('a-1', 'one', 1_000, '_:h1')))
    .when('an update of a-1 into "h2" throws, then a-2 arrives', state => {
      let error: unknown;
      // The store rejects a `BigInt` in a JSON literal (as `JSON.stringify()` throws). The JSON projection never holds
      // one, so it is injected here: the store throws after a-1 already left "h1" in the transaction.
      const toJSONValueSpy = jest
        .spyOn(toJSONValueModule, 'default')
        .mockImplementationOnce(value => ({ ...(value as object), value: BigInt(1) }));

      try {
        receive(state, botActivity('a-1', 'one updated', 1_000, '_:h2'));
      } catch (caught) {
        error = caught;
      } finally {
        toJSONValueSpy.mockRestore();
      }

      return { error, nextState: receive(state, botActivity('a-2', 'two', 2_000)) };
    })
    .then('should throw', (_, { error }) => expect(error).toBeInstanceOf(Error))
    // Before the fix: ["two"], the partial edit had detached a-1.
    .and('should keep a-1 as before the failed update', (_, { nextState }) =>
      expect(texts(nextState)).toEqual(['one', 'two'])
    )
    .and('should keep a-1 in "h1"', (_, { nextState }) =>
      expect(nextState.howToGroupingMap.get('_:h1' as any)?.partList).toHaveLength(1)
    );
});
