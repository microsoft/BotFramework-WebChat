/* eslint-disable no-restricted-globals */
// Moved from `packages/store` (phase 3). Scenarios from html2 `__tests__/html2/replyToId/firstSetOfActivities.html` and
// `subsequentSetOfActivities.html` (same activities and clock ticks), plus cases of the former `waitForActivityId()` that
// no test pinned.
//
// Wiring under test: activity → hold → `upsert()` (a store transaction on the activities graph) → `sortedActivities`.
// The hold reads the transcript from the graph (`hasReplyTarget()`, `hasBotActivity()`).
import { scenario } from '@testduet/given-when-then';
import { parse } from 'valibot';
import { hasBotActivity, hasReplyTarget } from '../../reducers/activities/sort/graph/queries';
import { LocalIdSchema } from '../../reducers/activities/sort/property/LocalId';
import type { State } from '../../reducers/activities/sort/types';
import upsert, { INITIAL_STATE } from '../../reducers/activities/sort/upsert';
import createFakeClock from './createFakeClock';
import ReplyToIdHold from './ReplyToIdHold';

type TestActivity = {
  readonly id: string;
  readonly replyToId?: string | undefined;
  readonly role: 'bot' | 'user';
  readonly text: string;
  readonly timestamp: number;
};

function createHarness(initialActivities: readonly TestActivity[] = []) {
  const clock = createFakeClock();
  let state: State = INITIAL_STATE;

  const upsertActivity = ({ id, replyToId, role, text, timestamp }: TestActivity) => {
    state = upsert({ Date }, state, {
      channelData: { 'webchat:internal:local-id': parse(LocalIdSchema, `_:${id}`) },
      from: { id: role, role },
      id,
      ...(replyToId ? { replyToId } : {}),
      text,
      timestamp: new Date(timestamp).toISOString(),
      type: 'message'
    } as any);
  };

  initialActivities.forEach(upsertActivity);

  const hold = new ReplyToIdHold<TestActivity>({
    clock,
    hasReplyTarget: replyToId => !!state.graph && hasReplyTarget(state.graph, replyToId),
    isHoldEnabled: () => !!state.graph && hasBotActivity(state.graph),
    release: upsertActivity
  });

  return Object.freeze({
    clock,
    hold,
    texts: () => state.sortedActivities.map(activity => ('text' in activity ? activity.text : undefined))
  });
}

scenario('first set of activities', bdd => {
  bdd
    .given('an empty transcript', () => createHarness())
    .when('the first bot activity replies to a missing activity', harness => {
      harness.hold.push({ id: '1.0', replyToId: '0.0', role: 'bot', text: 'First', timestamp: 0 });

      return harness;
    })
    // The first bot activity usually replies to an activity that is never shown, e.g. "conversationUpdate".
    .then('should show it without delay', (_, harness) => expect(harness.texts()).toEqual(['First']))
    .when('another bot activity replies to the same missing activity', (_, harness) => {
      harness.hold.push({ id: '2.0', replyToId: '0.0', role: 'bot', text: 'Second', timestamp: 1 });

      return harness;
    })
    // "0.0" is considered lost: we already gave it a chance with "1.0".
    .then('should show it without delay', (_, harness) => expect(harness.texts()).toEqual(['First', 'Second']));
});

scenario('subsequent set of activities', bdd => {
  bdd
    .given('a transcript with a bot activity', () =>
      createHarness([{ id: '1.0', role: 'bot', text: 'In irure voluptate consequat ad.', timestamp: 0 }])
    )
    .when('at t=1000ms, a reply to a missing activity arrives', harness => {
      harness.clock.tick(1_000);
      harness.hold.push({ id: '2.0', replyToId: '0.0', role: 'bot', text: '2.0', timestamp: 1_000 });

      return harness;
    })
    .then('should hold it', (_, harness) => {
      expect(harness.texts()).toEqual(['In irure voluptate consequat ad.']);
      expect(harness.hold.size).toBe(1);
    })
    .when('at t=3000ms, another reply to the same missing activity arrives', (_, harness) => {
      harness.clock.tick(2_000);
      harness.hold.push({ id: '2.1', replyToId: '0.0', role: 'bot', text: '2.1', timestamp: 3_000 });

      return harness;
    })
    .then('should hold both', (_, harness) => {
      expect(harness.texts()).toEqual(['In irure voluptate consequat ad.']);
      expect(harness.hold.size).toBe(2);
    })
    .when('at t=6000ms, the first reply times out after 5 seconds', (_, harness) => {
      harness.clock.tick(3_000);

      return harness;
    })
    // Releasing "2.0" puts a reply to "0.0" in the transcript, so "2.1" stops waiting too.
    .then('should show both replies together', (_, harness) => {
      expect(harness.texts()).toEqual(['In irure voluptate consequat ad.', '2.0', '2.1']);
      expect(harness.hold.size).toBe(0);
    })
    .when('at t=7000ms, a third reply to the same missing activity arrives', (_, harness) => {
      harness.clock.tick(1_000);
      harness.hold.push({ id: '3.0', replyToId: '0.0', role: 'bot', text: '3.0', timestamp: 7_000 });

      return harness;
    })
    .then('should show it without delay', (_, harness) =>
      expect(harness.texts()).toEqual(['In irure voluptate consequat ad.', '2.0', '2.1', '3.0'])
    );
});

scenario('the activity replied to arrives', bdd => {
  bdd
    .given('a transcript with a bot activity', () =>
      createHarness([{ id: '1.0', role: 'bot', text: 'Welcome', timestamp: 0 }])
    )
    .when(
      'a reply arrives before the activity it replies to, then an unrelated activity, then the activity',
      harness => {
        harness.hold.push({ id: '3.0', replyToId: '2.0', role: 'bot', text: 'Answer', timestamp: 3_000 });
        harness.hold.push({ id: '4.0', role: 'bot', text: 'Unrelated', timestamp: 4_000 });

        const textsBeforeTarget = harness.texts();

        harness.hold.push({ id: '2.0', role: 'user', text: 'Question', timestamp: 2_000 });

        return { harness, textsBeforeTarget };
      }
    )
    // An activity without `replyToId` is not held, so it overtakes the held reply.
    .then('should show the unrelated activity while the reply is held', (_, { textsBeforeTarget }) =>
      expect(textsBeforeTarget).toEqual(['Welcome', 'Unrelated'])
    )
    .and('should release the reply after the activity it replies to', (_, { harness }) => {
      expect(harness.texts()).toEqual(['Welcome', 'Question', 'Answer', 'Unrelated']);
      expect(harness.hold.size).toBe(0);
    });
});

scenario('a chain of replies', bdd => {
  bdd
    .given('a transcript with a bot activity', () =>
      createHarness([{ id: '1.0', role: 'bot', text: 'Welcome', timestamp: 0 }])
    )
    .when('a reply to a held reply arrives, then the first activity', harness => {
      harness.hold.push({ id: '3.0', replyToId: '2.0', role: 'bot', text: 'Second reply', timestamp: 3_000 });
      harness.hold.push({ id: '2.0', replyToId: '1.5', role: 'bot', text: 'First reply', timestamp: 2_000 });

      const sizeBeforeTarget = harness.hold.size;

      harness.hold.push({ id: '1.5', role: 'user', text: 'Question', timestamp: 1_500 });

      return { harness, sizeBeforeTarget };
    })
    .then('should hold both replies until the first activity arrives', (_, { sizeBeforeTarget }) =>
      expect(sizeBeforeTarget).toBe(2)
    )
    .and('should release the whole chain', (_, { harness }) => {
      expect(harness.texts()).toEqual(['Welcome', 'Question', 'First reply', 'Second reply']);
      expect(harness.hold.size).toBe(0);
    });
});

scenario('a held reply times out', bdd => {
  bdd
    .given('a held reply', () => {
      const harness = createHarness([{ id: '1.0', role: 'bot', text: 'Welcome', timestamp: 0 }]);

      harness.hold.push({ id: '2.0', replyToId: '0.0', role: 'bot', text: 'Reply', timestamp: 1_000 });

      return { harness, warn: jest.spyOn(console, 'warn').mockImplementation(() => undefined) };
    })
    .when('5 seconds pass', ({ harness }) => harness.clock.tick(5_000))
    .then('should warn with both IDs, as before', ({ warn }) => {
      expect(warn).toHaveBeenCalledWith(
        'botframework-webchat: Timed out while waiting for activity "0.0" which activity "2.0" is replying to.',
        expect.anything()
      );

      warn.mockRestore();
    });
});

scenario('closing the hold', bdd => {
  bdd
    .given('a held reply', () => {
      const harness = createHarness([{ id: '1.0', role: 'bot', text: 'Welcome', timestamp: 0 }]);

      harness.hold.push({ id: '2.0', replyToId: '0.0', role: 'bot', text: 'Reply', timestamp: 1_000 });

      return harness;
    })
    .when('closed, then the timeout passes', harness => {
      harness.hold.close();
      harness.clock.tick(5_000);

      return harness;
    })
    // Same as before: on disconnect, the saga holding the reply is cancelled and the reply is dropped.
    .then('should drop the held reply', (_, harness) => {
      expect(harness.texts()).toEqual(['Welcome']);
      expect(harness.hold.size).toBe(0);
    })
    .and('should not accept new activities', (_, harness) =>
      expect(() => harness.hold.push({ id: '3.0', role: 'bot', text: 'Late', timestamp: 2_000 })).toThrow()
    );
});

scenario('invalid timeout', bdd => {
  bdd
    .given('a negative timeout', () => -1)
    .when(
      'creating a hold',
      timeout => () =>
        new ReplyToIdHold({
          hasReplyTarget: () => false,
          isHoldEnabled: () => false,
          release: () => undefined,
          timeout
        })
    )
    .then('should throw', (_, create) => expect(create).toThrow());

  bdd
    .given('a timeout of NaN', () => NaN)
    .when(
      'creating a hold',
      timeout => () =>
        new ReplyToIdHold({
          hasReplyTarget: () => false,
          isHoldEnabled: () => false,
          release: () => undefined,
          timeout
        })
    )
    .then('should throw', (_, create) => expect(create).toThrow());
});
