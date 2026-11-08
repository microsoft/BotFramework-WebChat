/* eslint-disable complexity */
/* eslint-disable no-restricted-globals */
// The direct adapter against the operations it wraps: the same sequences of actions, as core's reducer receives them,
// are applied to `createActivitiesStore()` and folded over the pure operations (what the reducer does), and the
// states must read the same after every step. The actions are random (seeded): messages, HowTo parts, livestream
// revisions in and out of order, outgoing activities, marks and deletes. Core compares the adapter with its reducer
// (`createGroupedActivitiesReducer.adapter.spec.ts`).
import { scenario } from '@testduet/given-when-then';
import createActivitiesStore from './createActivitiesStore';
import createInitialState from './operations/createInitialState';
import deleteActivityById from './operations/deleteActivityById';
import markActivity from './operations/markActivity';
import postActivityFulfilled from './operations/postActivityFulfilled';
import postActivityImpeded from './operations/postActivityImpeded';
import postActivityPending from './operations/postActivityPending';
import postActivityRejected from './operations/postActivityRejected';
import receiveActivity from './operations/receiveActivity';
import type { ActivitiesCoreState } from './types';

type Mix = { churn: boolean; howTo: boolean; livestream: boolean; revDelete: boolean; wild: boolean };
type Action = { readonly meta?: any; readonly payload: any; readonly type: string };

class FixedDate extends Date {
  static now() {
    return 1_700_000_000_000;
  }
}

const env = { Date: FixedDate as DateConstructor };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;

    return seed / 4294967296;
  };
}

// The action → operation translation that core's reducer does (`createGroupedActivitiesReducer.ts`).
function reduce(state: ActivitiesCoreState, { meta, payload, type }: Action): ActivitiesCoreState {
  switch (type) {
    case 'DIRECT_LINE/DELETE_ACTIVITY':
      return deleteActivityById(state, payload.activityID);
    case 'DIRECT_LINE/INCOMING_ACTIVITY':
      return receiveActivity(state, payload.activity, env);
    case 'WEB_CHAT/MARK_ACTIVITY':
      return markActivity(state, payload.activityID, payload.name, payload.value);
    case 'DIRECT_LINE/POST_ACTIVITY_FULFILLED':
      return postActivityFulfilled(state, meta.clientActivityID, payload.activity, env);
    case 'DIRECT_LINE/POST_ACTIVITY_IMPEDED':
      return postActivityImpeded(state, meta.clientActivityID);
    case 'DIRECT_LINE/POST_ACTIVITY_PENDING':
      return postActivityPending(state, payload.activity, env);
    case 'DIRECT_LINE/POST_ACTIVITY_REJECTED':
      return postActivityRejected(state, meta.clientActivityID);
    default:
      return state;
  }
}

function dispatch(store: ReturnType<typeof createActivitiesStore>, { meta, payload, type }: Action): void {
  switch (type) {
    case 'DIRECT_LINE/DELETE_ACTIVITY':
      return store.deleteActivity(payload.activityID);
    case 'DIRECT_LINE/INCOMING_ACTIVITY':
      return store.receiveActivity(payload.activity);
    case 'WEB_CHAT/MARK_ACTIVITY':
      return store.markActivity(payload.activityID, payload.name, payload.value);
    case 'DIRECT_LINE/POST_ACTIVITY_FULFILLED':
      return store.postActivityFulfilled(meta.clientActivityID, payload.activity);
    case 'DIRECT_LINE/POST_ACTIVITY_IMPEDED':
      return store.postActivityImpeded(meta.clientActivityID);
    case 'DIRECT_LINE/POST_ACTIVITY_PENDING':
      return store.postActivityPending(payload.activity);
    case 'DIRECT_LINE/POST_ACTIVITY_REJECTED':
      return store.postActivityRejected(meta.clientActivityID);
    default:
      return undefined;
  }
}

// What a state shows: the list without local IDs (random), the maps by activity ID.
function view(state: ActivitiesCoreState) {
  const localToId = (localId: string) =>
    (activity => activity && (activity.id ?? activity.text))(state.activityMap.get(localId as any)?.activity) ??
    `?${localId}`;
  const normalize = ({ channelData = {}, ...rest }: any) => {
    const { 'webchat:internal:local-id': _, ...otherChannelData } = channelData;

    return JSON.stringify({ ...rest, channelData: otherChannelData }, (_, value) =>
      typeof value === 'function' ? '<fn>' : typeof value === 'number' && !isFinite(value) ? `<${value}>` : value
    );
  };

  return {
    activityIds: [...state.activityIdToLocalIdMap.keys()].sort(),
    clientIds: [...state.clientActivityIdToLocalIdMap.keys()].sort(),
    history: state.sortedChatHistoryList.map(entry =>
      entry.type === 'activity'
        ? `a:${localToId(entry.activityLocalId)}:${entry.logicalTimestamp}`
        : `${entry.type}:${entry.logicalTimestamp}`
    ),
    howTos: [...state.howToGroupingMap.entries()]
      .map(
        ([id, { logicalTimestamp, partList }]) =>
          `${id}:${logicalTimestamp}:${partList.map(part => `${part.type === 'activity' ? localToId(part.activityLocalId) : part.livestreamSessionId}@${part.position}`).join(',')}`
      )
      .sort(),
    list: state.sortedActivities.map(normalize),
    sessions: [...state.livestreamSessionMap.entries()]
      .map(
        ([id, { activities, finalized, logicalTimestamp }]) =>
          `${id}:${finalized}:${logicalTimestamp}:${activities.map(entry => `${localToId(entry.activityLocalId)}/${entry.sequenceNumber}`).join(',')}`
      )
      .sort()
  };
}

function* generateActions(seed: number, steps: number, mix: Mix): Generator<Action> {
  const random = rng(seed);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)] as T;
  const sentIds: string[] = [];
  const pending: string[] = [];
  const sessions = new Map<string, number>();
  const revisions: [string, string][] = [];
  const finalizedSessions = new Set<string>();
  let numClientActivity = 0;

  for (let step = 0; step < steps; step++) {
    const r = random();
    const timestamp = () =>
      mix.churn && random() < 0.1
        ? undefined
        : random() < 0.15
          ? new FixedDate(Math.floor(random() * 100) * 1000)
          : new Date(Math.floor(random() * 100) * 1000).toISOString();
    const extra = () => ({
      attachments: [
        { content: { body: [{ text: `s${step}` }] }, contentType: 'application/vnd.microsoft.card.adaptive' }
      ],
      ...(random() < 0.2 ? { value: { fn: () => step, nan: NaN, when: new FixedDate(step) } } : {}),
      ...(mix.howTo && random() < (mix.churn ? 0.4 : 0.25)
        ? {
            entities: [
              {
                '@context': 'https://schema.org',
                '@id': '',
                '@type': 'Message',
                isPartOf: { '@id': `h-${Math.floor(random() * (mix.churn ? 5 : 3))}`, '@type': 'HowTo' },
                position: Math.floor(random() * 5) + 1,
                type: 'https://schema.org/Message'
              }
            ]
          }
        : {})
    });

    if (r < 0.35) {
      const id = random() < (mix.churn ? 0.6 : 0.3) && sentIds.length ? pick(sentIds) : `b-${step}`;
      const time = timestamp();

      sentIds.includes(id) || sentIds.push(id);

      yield {
        payload: {
          activity: {
            channelData: {},
            from: { id: 'bot', role: 'bot' },
            id,
            text: `t${step}`,
            ...(typeof time === 'undefined' ? {} : { timestamp: time }),
            type: 'message',
            ...extra()
          }
        },
        type: 'DIRECT_LINE/INCOMING_ACTIVITY'
      };
    } else if (mix.livestream && r < 0.55) {
      let sessionId = random() < 0.7 && sessions.size ? pick([...sessions.keys()]) : `s-${step}`;
      let sequence = (sessions.get(sessionId) ?? 0) + 1;

      sessions.set(sessionId, sequence);

      let final = sequence > 1 && random() < 0.2;
      let id = sequence === 1 ? sessionId : `${sessionId}-r${sequence}`;
      const wild = mix.wild ? random() : 1;

      if (wild < 0.15 && sequence > 2) {
        // An older revision (new ID) arrives after newer ones.
        sequence = 1 + Math.floor(random() * (sequence - 1));
        id = `${sessionId}-o${step}`;
        final = false;
      } else if (wild < 0.3 && revisions.length) {
        // A revision is sent again, with another sequence number, or as the final one.
        [id, sessionId] = pick(revisions);
        sequence = 1 + Math.floor(random() * ((sessions.get(sessionId) ?? 1) + 2));
        final = random() < 0.3;
      } else if (wild < 0.4 && revisions.length && sessions.size > 1) {
        // A revision moves to another session.
        [id] = pick(revisions);
        sessionId = pick([...sessions.keys()]);
        sequence = 1 + Math.floor(random() * ((sessions.get(sessionId) ?? 1) + 2));
        final = random() < 0.3;
      }

      revisions.push([id, sessionId]);
      final && finalizedSessions.add(sessionId);
      mix.revDelete && !sentIds.includes(id) && sentIds.push(id);

      const time = timestamp();

      yield {
        payload: {
          activity: {
            channelData: final
              ? { streamId: sessionId, streamType: 'final' }
              : sequence === 1 && id === sessionId
                ? { streamSequence: 1, streamType: 'streaming' }
                : { streamId: sessionId, streamSequence: sequence, streamType: 'streaming' },
            from: { id: 'bot', role: 'bot' },
            id,
            text: `l${step}`,
            ...(typeof time === 'undefined' ? {} : { timestamp: time }),
            type: final || random() < (mix.wild ? 0.1 : 0.5) ? 'message' : 'typing',
            ...extra()
          }
        },
        type: 'DIRECT_LINE/INCOMING_ACTIVITY'
      };
    } else if (r < 0.65) {
      const clientActivityID = `c-${numClientActivity++}`;

      pending.push(clientActivityID);

      yield {
        meta: { clientActivityID, method: 'code' },
        payload: {
          activity: {
            channelData: { clientActivityID },
            from: { id: 'u', role: 'user' },
            text: `u${step}`,
            timestamp: timestamp(),
            type: 'message',
            ...extra()
          }
        },
        type: 'DIRECT_LINE/POST_ACTIVITY_PENDING'
      };
    } else if (r < 0.8 && pending.length) {
      const clientActivityID = pick(pending);
      const kind = random();
      const activity = {
        channelData: { clientActivityID },
        from: { id: 'u', role: 'user' },
        id: `u-${clientActivityID}`,
        text: `echo${step}`,
        timestamp: timestamp(),
        type: 'message',
        ...extra()
      };

      const meta = { clientActivityID, method: 'code' };

      yield kind < 0.35
        ? { meta, payload: { activity }, type: 'DIRECT_LINE/POST_ACTIVITY_FULFILLED' }
        : kind < 0.5
          ? { meta, payload: new Error('x'), type: 'DIRECT_LINE/POST_ACTIVITY_REJECTED' }
          : kind < 0.6
            ? { meta, payload: { activity }, type: 'DIRECT_LINE/POST_ACTIVITY_IMPEDED' }
            : { payload: { activity }, type: 'DIRECT_LINE/INCOMING_ACTIVITY' };
    } else if (r < 0.88 && sentIds.length) {
      yield {
        payload: { activityID: pick(sentIds), name: 'speak', value: random() < 0.5 ? { fn: () => 1 } : false },
        type: 'WEB_CHAT/MARK_ACTIVITY'
      };
    } else if (r < 0.93 && sentIds.length) {
      // Wild: mostly delete a revision of a session that got its final revision (shows hidden revisions again).
      const finalRevisionIds = mix.wild
        ? revisions.filter(([, sessionId]) => finalizedSessions.has(sessionId)).map(([id]) => id)
        : [];

      yield {
        payload: {
          activityID: finalRevisionIds.length && random() < 0.7 ? pick(finalRevisionIds) : pick(sentIds)
        },
        type: 'DIRECT_LINE/DELETE_ACTIVITY'
      };
    }
  }
}

const MIXES: readonly (readonly [string, Mix])[] = [
  ['flat', { churn: false, howTo: false, livestream: false, revDelete: false, wild: false }],
  ['HowTo', { churn: true, howTo: true, livestream: false, revDelete: false, wild: false }],
  ['livestream', { churn: true, howTo: false, livestream: true, revDelete: true, wild: true }],
  ['all', { churn: true, howTo: true, livestream: true, revDelete: true, wild: true }]
];

scenario('the direct adapter reads the same as the operations, after every action', bdd => {
  for (const [name, mix] of MIXES) {
    bdd
      .given(`the actions of 3 seeds × 200 steps, ${name}`, () =>
        [1, 2, 3].map(seed => Array.from(generateActions(seed * 7919, 200, mix)))
      )
      .when('each sequence is applied to a direct adapter and folded over the operations', sequences =>
        sequences.map(actions => {
          const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
          const store = createActivitiesStore({ ponyfill: env });
          const differences: string[] = [];
          let numError = 0;
          let state = createInitialState();

          try {
            actions.forEach((action, index) => {
              let expectedError: unknown;
              let actualError: unknown;

              try {
                state = reduce(state, action);
              } catch (error) {
                expectedError = error;
              }

              try {
                dispatch(store, action);
              } catch (error) {
                actualError = error;
              }

              expectedError && numError++;

              if (!expectedError !== !actualError) {
                differences.push(`step ${index} ${action.type}: throws ${!!expectedError} vs ${!!actualError}`);
              } else if (JSON.stringify(view(store.getSnapshot())) !== JSON.stringify(view(state))) {
                differences.push(`step ${index} ${action.type}: reads differently`);
              }
            });
          } finally {
            warn.mockRestore();
          }

          return { differences, numError, numShown: store.getSnapshot().sortedActivities.length };
        })
      )
      .then('should read the same', (_, results) =>
        expect(results.flatMap(({ differences }) => differences)).toEqual([])
      )
      .and('should have shown activities', (_, results) =>
        results.forEach(({ numShown }) => expect(numShown).toBeGreaterThan(0))
      );
  }
});
