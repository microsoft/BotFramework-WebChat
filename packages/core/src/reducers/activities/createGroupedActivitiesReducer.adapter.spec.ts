/* eslint-disable no-restricted-globals */
// The direct adapter (`createActivitiesStore()`) against this reducer: the same sequences, as actions to the reducer and
// as operations to the adapter, must show the same activities after every step, and fail on the same steps.
import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';
import { scenario } from '@testduet/given-when-then';
import createGroupedActivitiesReducer from './createGroupedActivitiesReducer';

type Action = { readonly meta?: any; readonly payload: any; readonly type: string };

class FixedDate extends Date {
  static now() {
    return 1_700_000_000_000;
  }
}

const ponyfill: any = { clearTimeout, Date: FixedDate, setTimeout };
const debugAPI: any = { UNSAFE_callBreakpoint: { incomingActivity: () => undefined } };

function message(id: string, timestamp: number | undefined, extra: Record<string, unknown> = {}) {
  return {
    channelData: {},
    from: { id: 'bot', role: 'bot' },
    id,
    text: id,
    ...(typeof timestamp === 'number' ? { timestamp: new Date(timestamp).toISOString() } : {}),
    type: 'message',
    ...extra
  };
}

const howTo = (groupingId: string, position: number) => ({
  entities: [
    {
      '@context': 'https://schema.org',
      '@id': '',
      '@type': 'Message',
      isPartOf: { '@id': groupingId, '@type': 'HowTo' },
      position,
      type: 'https://schema.org/Message'
    }
  ]
});

const revision = (id: string, sessionId: string, sequence: number, timestamp: number, final = false) =>
  message(id, timestamp, {
    channelData: final
      ? { streamId: sessionId, streamType: 'final' }
      : id === sessionId
        ? { streamSequence: sequence, streamType: 'streaming' }
        : { streamId: sessionId, streamSequence: sequence, streamType: 'streaming' },
    type: final ? 'message' : 'typing'
  });

const outgoing = (clientActivityID: string, timestamp: number) => ({
  channelData: { clientActivityID },
  from: { id: 'u', role: 'user' },
  text: clientActivityID,
  timestamp: new Date(timestamp).toISOString(),
  type: 'message'
});

const echo = (clientActivityID: string, timestamp: number) => ({
  ...outgoing(clientActivityID, timestamp),
  id: `u-${clientActivityID}`
});

const incoming = (activity: unknown): Action => ({ payload: { activity }, type: 'DIRECT_LINE/INCOMING_ACTIVITY' });
const pending = (clientActivityID: string, timestamp: number): Action => ({
  meta: { clientActivityID, method: 'code' },
  payload: { activity: outgoing(clientActivityID, timestamp) },
  type: 'DIRECT_LINE/POST_ACTIVITY_PENDING'
});
const fulfilled = (clientActivityID: string, timestamp: number): Action => ({
  meta: { clientActivityID, method: 'code' },
  payload: { activity: echo(clientActivityID, timestamp) },
  type: 'DIRECT_LINE/POST_ACTIVITY_FULFILLED'
});
const impeded = (clientActivityID: string): Action => ({
  meta: { clientActivityID, method: 'code' },
  payload: { activity: outgoing(clientActivityID, 0) },
  type: 'DIRECT_LINE/POST_ACTIVITY_IMPEDED'
});
const rejected = (clientActivityID: string): Action => ({
  meta: { clientActivityID, method: 'code' },
  payload: new Error('rejected'),
  type: 'DIRECT_LINE/POST_ACTIVITY_REJECTED'
});
const mark = (activityID: string, name: string, value: unknown): Action => ({
  payload: { activityID, name, value },
  type: 'WEB_CHAT/MARK_ACTIVITY'
});
const remove = (activityID: string): Action => ({ payload: { activityID }, type: 'DIRECT_LINE/DELETE_ACTIVITY' });

function dispatch(store: ReturnType<typeof createActivitiesStore>, { meta, payload, type }: Action): void {
  switch (type) {
    case 'DIRECT_LINE/DELETE_ACTIVITY':
      return store.deleteActivity(payload.activityID);
    case 'DIRECT_LINE/INCOMING_ACTIVITY':
      return store.receiveActivity(payload.activity);
    case 'DIRECT_LINE/POST_ACTIVITY_FULFILLED':
      return store.postActivityFulfilled(meta.clientActivityID, payload.activity);
    case 'DIRECT_LINE/POST_ACTIVITY_IMPEDED':
      return store.postActivityImpeded(meta.clientActivityID);
    case 'DIRECT_LINE/POST_ACTIVITY_PENDING':
      return store.postActivityPending(payload.activity);
    case 'DIRECT_LINE/POST_ACTIVITY_REJECTED':
      return store.postActivityRejected(meta.clientActivityID);
    case 'WEB_CHAT/MARK_ACTIVITY':
      return store.markActivity(payload.activityID, payload.name, payload.value);
    default:
      throw new Error(`Unknown action ${type}`);
  }
}

// The local IDs are random: compare without them.
const shown = ({ sortedActivities }: { readonly sortedActivities: readonly any[] }) =>
  sortedActivities.map(({ channelData: { 'webchat:internal:local-id': _, ...channelData }, ...activity }) => ({
    ...activity,
    channelData
  }));

const SEQUENCES: readonly (readonly [string, readonly Action[]])[] = [
  [
    'messages out of order, updated, without a timestamp',
    [
      incoming(message('a-3', 3_000)),
      incoming(message('a-1', 1_000)),
      incoming(message('a-2', 2_000)),
      incoming(message('a-1', 4_000, { text: 'one again' })),
      incoming(message('a-4', undefined)),
      incoming(message('a-0', 500, { replyToId: 'a-1' }))
    ]
  ],
  [
    'outgoing activities: sent, failed, impeded, echoed, unknown',
    [
      incoming(message('a-1', 1_000)),
      pending('c-1', 2_000),
      pending('c-2', 3_000),
      fulfilled('c-1', 2_500),
      rejected('c-2'),
      pending('c-3', 4_000),
      impeded('c-3'),
      incoming(echo('c-3', 4_500)),
      fulfilled('c-9', 5_000),
      rejected('c-9'),
      incoming(message('a-2', 6_000, { replyToId: 'u-c-1' }))
    ]
  ],
  [
    'HowTo parts out of order, moved to another grouping, deleted',
    [
      incoming(message('h-2', 2_000, howTo('g-1', 2))),
      incoming(message('h-1', 1_000, howTo('g-1', 1))),
      incoming(message('a-1', 1_500)),
      incoming(message('h-3', 3_000, howTo('g-1', 3))),
      incoming(message('h-2', 2_000, howTo('g-2', 1))),
      remove('h-1'),
      incoming(message('h-4', 500, howTo('g-2', 2)))
    ]
  ],
  [
    'livestream revisions in and out of order, finalized, a revision deleted',
    [
      incoming(revision('s-1', 's-1', 1, 1_000)),
      incoming(revision('s-1-r2', 's-1', 2, 1_100)),
      incoming(revision('s-1-r4', 's-1', 4, 1_300)),
      incoming(revision('s-1-r3', 's-1', 3, 1_200)),
      incoming(message('a-1', 1_250)),
      incoming(revision('s-2', 's-2', 1, 2_000)),
      incoming(revision('s-1-r5', 's-1', 5, 1_400, true)),
      remove('s-1-r5'),
      incoming(revision('s-2-r2', 's-2', 2, 2_100, true)),
      incoming(revision('s-2-r3', 's-2', 3, 2_200))
    ]
  ],
  [
    'marks and deletes, known and unknown',
    [
      incoming(message('a-1', 1_000)),
      incoming(message('a-2', 2_000)),
      mark('a-1', 'speak', false),
      mark('a-9', 'speak', true),
      mark('a-2', 'speak', true),
      remove('a-9'),
      remove('a-1'),
      incoming(message('a-1', 1_000)),
      mark('a-1', 'speak', false)
    ]
  ]
];

scenario('the direct adapter shows the same activities as the reducer', bdd => {
  for (const [name, actions] of SEQUENCES) {
    bdd
      .given(`${name}, as actions and as operations`, () => actions)
      .when('each step is applied to the reducer and to a direct adapter', actions => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
          const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
          const store = createActivitiesStore({ ponyfill });
          let state = reducer(undefined, { type: '@@INIT' } as any);

          return actions.map(action => {
            let reducerError: unknown;
            let storeError: unknown;

            try {
              state = reducer(state, action as any);
            } catch (error) {
              reducerError = error;
            }

            try {
              dispatch(store, action);
            } catch (error) {
              storeError = error;
            }

            return {
              reducer: { shown: shown(state), throws: !!reducerError },
              store: { shown: shown(store.getSnapshot()), throws: !!storeError }
            };
          });
        } finally {
          warn.mockRestore();
        }
      })
      .then('should show the same after every step', (_, steps) =>
        steps.forEach(({ reducer, store }) => expect(store).toEqual(reducer))
      )
      .and('should show activities', (_, steps) => expect(steps.at(-1)?.store.shown.length).toBeGreaterThan(0));
  }
});
