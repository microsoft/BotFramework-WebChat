// Ported from html2 `__tests__/html2/replyToId/firstSetOfActivities.html` and `subsequentSetOfActivities.html` (same
// activities and clock ticks), plus cases of `waitForActivityId()` in `packages/core/src/sagas/queueIncomingActivitySaga.ts`
// that no core test pins. Core has no unit test for this saga.
//
// Wiring under test: activity → hold → store transaction (`upsertSortedMessage`) → view. The node properties used to
// answer "is the target in the transcript" are test wiring; the Direct Line source decides the real vocabulary.
import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Node } from '../node/Node.ts';
import upsertSortedMessage from '../sort/upsertSortedMessage.ts';
import createFakeClock from '../testHelpers/createFakeClock.ts';
import { buildMessage, CONVERSATION_ID, createSortedTestStore, getView } from '../testHelpers/sortTestHelpers.ts';
import ReplyToIdHold from './ReplyToIdHold.ts';

const REPLY_TO_ID = 'urn:test:reply-to-id';
const ROLE = 'urn:test:role';

type Activity = {
  readonly id: string;
  readonly replyToId?: string | undefined;
  readonly role: 'bot' | 'user';
  readonly text: string;
  readonly timestamp: number;
};

function createHarness(initialActivities: readonly Activity[] = []) {
  const clock = createFakeClock();
  const testStore = createSortedTestStore();

  const nodes = (): readonly Node[] => Array.from(testStore.store.getSnapshot().values());

  const upsertActivity = ({ id, replyToId, role, text, timestamp }: Activity) =>
    testStore.edit(transaction => {
      const { node, ...sortFacts } = buildMessage({ id, logicalTimestamp: timestamp, text });

      upsertSortedMessage(transaction, CONVERSATION_ID, {
        ...sortFacts,
        node: { ...node, [ROLE]: [role], ...(replyToId ? { [REPLY_TO_ID]: [replyToId] } : {}) }
      });
    });

  initialActivities.forEach(upsertActivity);

  const hold = new ReplyToIdHold<Activity>({
    clock,
    hasReplyTarget: replyToId =>
      nodes().some(
        ({ '@id': nodeId, [REPLY_TO_ID]: replyToIds }) =>
          nodeId === `_:${replyToId}` || (Array.isArray(replyToIds) && replyToIds.includes(replyToId))
      ),
    isHoldEnabled: () => nodes().some(({ [ROLE]: roles }) => Array.isArray(roles) && roles.includes('bot')),
    release: upsertActivity
  });

  return Object.freeze({
    clock,
    hold,
    texts: () => getView(testStore).map(({ text }) => text)
  });
}

scenario(
  'first set of activities',
  bdd => {
    bdd
      .given('an empty transcript', () => createHarness())
      .when('the first bot activity replies to a missing activity', harness => {
        harness.hold.push({ id: '1.0', replyToId: '0.0', role: 'bot', text: 'First', timestamp: 0 });

        return harness;
      })
      // The first bot activity usually replies to an activity that is never shown, e.g. "conversationUpdate".
      .then('should show it without delay', (_, harness) => expect(harness.texts()).toEqual([['First']]))
      .when('another bot activity replies to the same missing activity', (_, harness) => {
        harness.hold.push({ id: '2.0', replyToId: '0.0', role: 'bot', text: 'Second', timestamp: 1 });

        return harness;
      })
      // "0.0" is considered lost: we already gave it a chance with "1.0".
      .then('should show it without delay', (_, harness) => expect(harness.texts()).toEqual([['First'], ['Second']]));
  },
  NodeTest
);

scenario(
  'subsequent set of activities',
  bdd => {
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
        expect(harness.texts()).toEqual([['In irure voluptate consequat ad.']]);
        expect(harness.hold.size).toBe(1);
      })
      .when('at t=3000ms, another reply to the same missing activity arrives', (_, harness) => {
        harness.clock.tick(2_000);
        harness.hold.push({ id: '2.1', replyToId: '0.0', role: 'bot', text: '2.1', timestamp: 3_000 });

        return harness;
      })
      .then('should hold both', (_, harness) => {
        expect(harness.texts()).toEqual([['In irure voluptate consequat ad.']]);
        expect(harness.hold.size).toBe(2);
      })
      .when('at t=6000ms, the first reply times out after 5 seconds', (_, harness) => {
        harness.clock.tick(3_000);

        return harness;
      })
      // Releasing "2.0" puts a reply to "0.0" in the transcript, so "2.1" stops waiting too.
      .then('should show both replies together', (_, harness) => {
        expect(harness.texts()).toEqual([['In irure voluptate consequat ad.'], ['2.0'], ['2.1']]);
        expect(harness.hold.size).toBe(0);
      })
      .when('at t=7000ms, a third reply to the same missing activity arrives', (_, harness) => {
        harness.clock.tick(1_000);
        harness.hold.push({ id: '3.0', replyToId: '0.0', role: 'bot', text: '3.0', timestamp: 7_000 });

        return harness;
      })
      .then('should show it without delay', (_, harness) =>
        expect(harness.texts()).toEqual([['In irure voluptate consequat ad.'], ['2.0'], ['2.1'], ['3.0']])
      );
  },
  NodeTest
);

scenario(
  'the activity replied to arrives',
  bdd => {
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
        expect(textsBeforeTarget).toEqual([['Welcome'], ['Unrelated']])
      )
      .and('should release the reply after the activity it replies to', (_, { harness }) => {
        expect(harness.texts()).toEqual([['Welcome'], ['Question'], ['Answer'], ['Unrelated']]);
        expect(harness.hold.size).toBe(0);
      });
  },
  NodeTest
);

scenario(
  'a chain of replies',
  bdd => {
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
        expect(harness.texts()).toEqual([['Welcome'], ['Question'], ['First reply'], ['Second reply']]);
        expect(harness.hold.size).toBe(0);
      });
  },
  NodeTest
);

scenario(
  'closing the hold',
  bdd => {
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
      // Same as core: on disconnect, the saga holding the reply is cancelled and the reply is dropped.
      .then('should drop the held reply', (_, harness) => {
        expect(harness.texts()).toEqual([['Welcome']]);
        expect(harness.hold.size).toBe(0);
      })
      .and('should not accept new activities', (_, harness) =>
        expect(() => harness.hold.push({ id: '3.0', role: 'bot', text: 'Late', timestamp: 2_000 })).toThrow()
      );
  },
  NodeTest
);
