/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/* eslint-disable no-restricted-globals */

import { GraphProvider, useOrderedActivities } from '@msinternal/botframework-webchat-api-graph';
import { useSuggestedActionsHooks } from '@msinternal/botframework-webchat-redux-store';
import { act, render } from '@testing-library/react';
import { createStoreWithOptions, type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { createActivitiesStore, type ActivitiesStore } from 'botframework-webchat-core/internal.js';
import React, { memo, type ReactNode } from 'react';

import WebChatAPIContext, { type WebChatAPIContextType } from '../../hooks/internal/WebChatAPIContext';
import { useChatOperationsContext } from '../../hooks/internal/domains/ChatOperationsContext';
import { useVoiceContext } from '../../hooks/internal/domains/VoiceContext';
import useActivities from '../../hooks/useActivities';
import useConnectivityStatus from '../../hooks/useConnectivityStatus';
import useNotifications from '../../hooks/useNotifications';
import useSendBoxValue from '../../hooks/useSendBoxValue';
import PonyfillComposer from '../Ponyfill/PonyfillComposer';
import DefaultProviders from './DefaultProviders';

type Action = { readonly meta?: any; readonly payload: any; readonly type: string };

class FixedDate extends Date {
  static now() {
    return 1_700_000_000_000;
  }
}

const PONYFILL: any = Object.freeze({ clearTimeout, Date: FixedDate, setTimeout });

const API_CONTEXT = Object.freeze({
  activityStatusRenderer: jest.fn(),
  setSendBox: jest.fn(),
  uiState: undefined
} satisfies WebChatAPIContextType);

// #region Activities and the actions of the Redux store; the same steps are applied as operations to the activities store

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

function applyOperation(store: ActivitiesStore, { meta, payload, type }: Action): void {
  switch (type) {
    case 'DIRECT_LINE/DELETE_ACTIVITY':
      return store.deleteActivity(payload.activityID);
    case 'DIRECT_LINE/INCOMING_ACTIVITY':
      return store.receiveActivity(payload.activity);
    case 'DIRECT_LINE/POST_ACTIVITY_FULFILLED':
      return store.postActivityFulfilled(meta.clientActivityID, payload.activity);
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
    'outgoing activities: sent, failed, echoed',
    [
      incoming(message('a-1', 1_000)),
      pending('c-1', 2_000),
      pending('c-2', 3_000),
      fulfilled('c-1', 2_500),
      rejected('c-2'),
      pending('c-3', 4_000),
      incoming(echo('c-3', 4_500)),
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
    'livestream revisions in and out of order, finalized',
    [
      incoming(revision('s-1', 's-1', 1, 1_000)),
      incoming(revision('s-1-r2', 's-1', 2, 1_100)),
      incoming(revision('s-1-r4', 's-1', 4, 1_300)),
      incoming(revision('s-1-r3', 's-1', 3, 1_200)),
      incoming(message('a-1', 1_250)),
      incoming(revision('s-2', 's-2', 1, 2_000)),
      incoming(revision('s-1-r5', 's-1', 5, 1_400, true)),
      incoming(revision('s-2-r2', 's-2', 2, 2_100, true))
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
      incoming(message('a-3', 3_000))
    ]
  ]
];

// #endregion

type ActivitiesRender = {
  readonly activities: readonly WebChatActivity[];
  readonly orderedActivities: readonly WebChatActivity[];
};

function ActivitiesRecorder({ renders }: { readonly renders: ActivitiesRender[] }) {
  const [activities] = useActivities();
  const [orderedActivities] = useOrderedActivities();

  renders.push({ activities, orderedActivities });

  return null;
}

const ActivitiesProbe = memo(ActivitiesRecorder);

// The local IDs are random: compare without them.
const shown = (activities: readonly WebChatActivity[]) =>
  activities.map(({ channelData: { 'webchat:internal:local-id': _, ...channelData }, ...activity }: any) => ({
    ...activity,
    channelData
  }));

let error: jest.SpyInstance;
let warn: jest.SpyInstance;

// Every warning of this file: the warnings are once per module.
const allWarnings: string[] = [];

beforeEach(() => {
  const { error: consoleError } = console;

  // Steps run outside of act() on purpose, to render each step on its own as an app does.
  error = jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
    String(message).includes('was not wrapped in act(...)') || consoleError(message, ...args);
  });

  warn = jest.spyOn(console, 'warn').mockImplementation(message => {
    allWarnings.push(message);
  });
});

afterEach(() => {
  error.mockRestore();
  warn.mockRestore();
});

describe.each(SEQUENCES)('<DefaultProviders> with %s', (_, actions) => {
  test('should show the same activities as the Redux store, with as many renders', () => {
    const reduxStore = createStoreWithOptions({ ponyfill: PONYFILL });
    const activitiesStore = createActivitiesStore({ ponyfill: PONYFILL });
    const reduxRenders: ActivitiesRender[] = [];
    const renders: ActivitiesRender[] = [];

    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <PonyfillComposer ponyfill={PONYFILL}>{children}</PonyfillComposer>
    );

    const reduxResult = render(
      <GraphProvider store={reduxStore}>
        <ActivitiesProbe renders={reduxRenders} />
      </GraphProvider>,
      { wrapper }
    );

    const result = render(
      <DefaultProviders activitiesStore={activitiesStore}>
        <ActivitiesProbe renders={renders} />
      </DefaultProviders>,
      { wrapper }
    );

    const check = () => {
      const { activities, orderedActivities } = renders.at(-1);

      // useActivities() is useOrderedActivities().
      expect(activities).toBe(orderedActivities);

      expect(renders).toHaveLength(reduxRenders.length);
      expect(shown(activities)).toEqual(shown(reduxRenders.at(-1).activities));

      // In the order of the activities store. (In both modes, a deleted activity is hidden at the next render only: the
      // graph keeps its node, and <GraphProvider> filters the nodes when it renders.)
      const { sortedActivities } = activitiesStore.getSnapshot();

      expect(activities.filter(activity => sortedActivities.includes(activity))).toEqual(
        sortedActivities.filter(activity => activities.includes(activity))
      );
    };

    check();

    // Outside of act(): each step renders on its own.
    for (const action of actions) {
      reduxStore.dispatch(action);
      applyOperation(activitiesStore, action);
      check();
    }

    // In one act(): one render.
    const numRenders = renders.length;

    act(() => {
      reduxStore.dispatch(incoming(message('z-1', 9_000)));
      applyOperation(activitiesStore, incoming(message('z-1', 9_000)));
      reduxStore.dispatch(incoming(message('z-2', 9_500)));
      applyOperation(activitiesStore, incoming(message('z-2', 9_500)));
    });

    check();
    expect(renders).toHaveLength(numRenders + 1);
    expect(
      renders
        .at(-1)
        .activities.slice(-2)
        .map(({ id }) => id)
    ).toEqual(['z-1', 'z-2']);

    result.unmount();
    reduxResult.unmount();
  });
});

describe('<DefaultProviders>', () => {
  test('should render every operation that adds an activity, and only those', () => {
    const activitiesStore = createActivitiesStore({ ponyfill: PONYFILL });
    const renders: ActivitiesRender[] = [];

    render(
      <PonyfillComposer ponyfill={PONYFILL}>
        <DefaultProviders activitiesStore={activitiesStore}>
          <ActivitiesProbe renders={renders} />
        </DefaultProviders>
      </PonyfillComposer>
    );

    expect(renders).toHaveLength(1);
    expect(renders[0].activities).toEqual([]);

    activitiesStore.receiveActivity(message('a-1', 1_000) as any);

    expect(renders).toHaveLength(2);
    expect(renders[1].activities.map(({ id }) => id)).toEqual(['a-1']);

    // An operation that changes nothing.
    activitiesStore.markActivity('a-9', 'speak', true);

    expect(renders).toHaveLength(2);

    activitiesStore.receiveActivity(message('a-2', 500) as any);

    expect(renders).toHaveLength(3);
    expect(renders[2].activities.map(({ id }) => id)).toEqual(['a-2', 'a-1']);
  });

  test('should create its own activities store from the ponyfill', () => {
    const renders: ActivitiesRender[] = [];

    const result = render(
      <PonyfillComposer ponyfill={PONYFILL}>
        <DefaultProviders>
          <ActivitiesProbe renders={renders} />
        </DefaultProviders>
      </PonyfillComposer>
    );

    expect(renders).toHaveLength(1);
    expect(renders[0].activities).toEqual([]);

    result.unmount();
  });

  test('should own the suggested actions without a store', () => {
    const states: ReturnType<ReturnType<typeof useSuggestedActionsHooks>['useSuggestedActions']>[] = [];
    const CARD_ACTIONS: readonly DirectLineCardAction[] = Object.freeze([
      Object.freeze({ title: 'Hello', type: 'imBack', value: 'Hello' } satisfies DirectLineCardAction)
    ]);

    function SuggestedActionsProbe() {
      states.push(useSuggestedActionsHooks().useSuggestedActions());

      return null;
    }

    render(
      <PonyfillComposer ponyfill={PONYFILL}>
        <DefaultProviders>
          <SuggestedActionsProbe />
        </DefaultProviders>
      </PonyfillComposer>
    );

    act(() => states.at(-1)[1](CARD_ACTIONS));

    expect(states).toHaveLength(2);
    expect(states.at(-1)[0]).toBe(CARD_ACTIONS);
    expect(states.at(-1)[2]).toEqual({ activity: undefined });
  });

  test('should provide placeholders with the initial values of the Redux store, and warn once in development', () => {
    const renders: unknown[] = [];
    const reduxState = createStoreWithOptions({ ponyfill: PONYFILL }).getState();

    function DomainProbe() {
      const chatOperations = useChatOperationsContext();
      const voice = useVoiceContext();

      renders.push({
        chatOperations,
        connectivityStatus: useConnectivityStatus()[0],
        notifications: useNotifications()[0],
        sendBoxValue: useSendBoxValue()[0],
        voice
      });

      return null;
    }

    // useSendBoxValue() reads its setter from WebChatAPIContext, which <Composer> fills.
    render(
      <PonyfillComposer ponyfill={PONYFILL}>
        <DefaultProviders>
          <WebChatAPIContext.Provider value={API_CONTEXT}>
            <DomainProbe />
          </WebChatAPIContext.Provider>
        </DefaultProviders>
      </PonyfillComposer>
    );

    const [{ chatOperations, connectivityStatus, notifications, sendBoxValue, voice }] = renders as any[];

    expect(connectivityStatus).toBe(reduxState.connectivityStatus);
    expect(notifications).toEqual(reduxState.notifications);
    expect(sendBoxValue).toBe(reduxState.sendBoxValue);

    expect(chatOperations.sendMessage('Hello')).toBeUndefined();
    chatOperations.sendMessage('Hello again');
    expect(typeof voice.registerVoiceHandler({})).toBe('function');

    const messages = warn.mock.calls.map(([message]) => message);

    expect(messages.filter(message => message.includes('"sendMessage"'))).toHaveLength(1);
    expect(messages.filter(message => message.includes('"registerVoiceHandler"'))).toHaveLength(1);

    // Last test of the file: <DefaultProviders> mounted many times, and warned once.
    expect(allWarnings.filter(message => message.includes('for tests only'))).toHaveLength(1);
  });
});
