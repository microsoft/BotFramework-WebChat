/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

// No microphone in the tests.
jest.mock('../providers/SpeechToSpeech/private/useRecorder', () => ({
  useRecorder: () => ({ mute: () => () => undefined, record: () => () => undefined })
}));

import { act, render, waitFor } from '@testing-library/react';
import { createStore } from 'botframework-webchat-core';
import React from 'react';

import { getStoreCounts, setWebChatEngineEnabled } from '../providers/internalWebChatEngine';
import Composer from './Composer';
import useActivities from './useActivities';
import useConnectivityStatus from './useConnectivityStatus';
import useSendBoxValue from './useSendBoxValue';
import useSendMessage from './useSendMessage';

type Observer = { readonly next?: ((value: any) => void) | undefined };

// A Direct Line that echoes every activity it posts, as the channel does. `connectionStatus$` replays its status.
function createDirectLine() {
  const activityObservers = new Set<Observer>();
  const statusObservers = new Set<Observer>();
  let status = 0;

  const subscribe = (observers: Set<Observer>, observer: Observer) => {
    observers.add(observer);

    return { unsubscribe: () => observers.delete(observer) };
  };

  return {
    directLine: {
      activity$: { subscribe: (observer: Observer) => subscribe(activityObservers, observer) },
      connectionStatus$: {
        subscribe: (observer: Observer) => {
          observer.next?.(status);

          return subscribe(statusObservers, observer);
        }
      },
      end: () => undefined,
      postActivity: (activity: any) => ({
        subscribe: ({ complete, next }: { complete?: () => void; next?: (id: string) => void }) => {
          next?.('a-1');
          complete?.();

          // The echo comes later, as from the channel (not a ponyfill clock: the store has the default one).
          // eslint-disable-next-line no-restricted-globals
          setTimeout(() => activityObservers.forEach(observer => observer.next?.({ ...activity, id: 'a-1' })));

          return { unsubscribe: () => undefined };
        }
      })
    },
    setStatus: (value: number) => {
      status = value;
      statusObservers.forEach(observer => observer.next?.(value));
    }
  };
}

// Renders <Composer> without a store, connects, types and sends "Hello". Returns a line per render of the probe.
async function connectTypeAndSend() {
  const { directLine, setStatus } = createDirectLine();
  const lines: string[] = [];
  let cardActionDispatch: (action: unknown) => unknown;
  let probe: { sendMessage: (text: string) => void; setSendBoxValue: (value: string) => void };

  function Probe() {
    const [activities] = useActivities();
    const [connectivityStatus] = useConnectivityStatus();
    const [sendBoxValue, setSendBoxValue] = useSendBoxValue();
    const sendMessage = useSendMessage();

    probe = { sendMessage, setSendBoxValue };
    lines.push(
      `${connectivityStatus} "${sendBoxValue}" [${activities.map(activity => `${activity.type === 'message' && activity.text} ${activity.channelData.state}`)}]`
    );

    return null;
  }

  const { unmount } = render(
    <Composer
      cardActionMiddleware={[
        ({ dispatch }) => {
          cardActionDispatch = dispatch;

          return next => next;
        }
      ]}
      directLine={directLine as any}
    >
      <Probe />
    </Composer>
  );

  // React 16.8 has no async act(): wait for the effects with waitFor() instead.
  act(() => setStatus(1));
  act(() => setStatus(2));
  await waitFor(() => expect(lines.at(-1)).toMatch(/^connected/u));
  act(() => probe.setSendBoxValue('Hello'));
  act(() => probe.sendMessage('Hello'));
  await waitFor(() => expect(lines.at(-1)).toContain('Hello sent'));

  unmount();

  return { cardActionDispatch, lines };
}

afterEach(() => setWebChatEngineEnabled(false));

test('without a store, the engine renders the same values, as many times, as Redux', async () => {
  const reduxRun = await connectTypeAndSend();
  const countsBefore = getStoreCounts();

  setWebChatEngineEnabled(true);

  const engineRun = await connectTypeAndSend();

  expect(getStoreCounts()).toEqual({ engine: countsBefore.engine + 1, redux: countsBefore.redux });
  expect(engineRun.lines).toEqual(reduxRun.lines);
  expect(reduxRun.lines).toEqual([
    'uninitialized "" []',
    'connected "" []',
    'connected "Hello" []',
    'connected "Hello" [Hello sending]',
    // The echo replaced the activity, before POST_ACTIVITY_FULFILLED marks it sent.
    'connected "Hello" [Hello undefined]',
    'connected "Hello" [Hello sent]'
  ]);

  // Card action middleware gets the dispatch of the store, which checks actions as Redux does.
  for (const action of [{}, { type: 1 }, () => undefined]) {
    let reduxError: Error;

    try {
      reduxRun.cardActionDispatch(action);
    } catch (error) {
      reduxError = error;
    }

    expect(() => engineRun.cardActionDispatch(action)).toThrow(reduxError.message);
  }
});

test('with the engine enabled, a store passed by the host is used as is', async () => {
  const actionTypes: string[] = [];
  const store = createStore({}, () => next => (action: { readonly type: string }) => {
    actionTypes.push(action.type);

    return next(action);
  });

  const countsBefore = getStoreCounts();

  setWebChatEngineEnabled(true);

  const { unmount } = render(<Composer directLine={createDirectLine().directLine as any} store={store} />);

  await waitFor(() => expect(actionTypes).toContain('DIRECT_LINE/CONNECT'));

  unmount();

  expect(getStoreCounts()).toEqual(countsBefore);
});
