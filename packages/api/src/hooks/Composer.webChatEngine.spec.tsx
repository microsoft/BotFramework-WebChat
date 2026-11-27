/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

// No microphone in the tests.
jest.mock('../providers/SpeechToSpeech/private/useRecorder', () => ({
  useRecorder: () => ({ mute: () => () => undefined, record: () => () => undefined })
}));

import { act, render, waitFor } from '@testing-library/react';
import { createStoreWithOptions } from 'botframework-webchat-core';
import { createWebChatEngine } from 'botframework-webchat-core/internal.js';
import React from 'react';

import Composer from './Composer';
import useActivities from './useActivities';
import useConnectivityStatus from './useConnectivityStatus';
import useSendBoxValue from './useSendBoxValue';
import useSendMessage from './useSendMessage';

type CreateStore = typeof createWebChatEngine;
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

// Renders <Composer> on a store from `createStore`, connects, types and sends "Hello". Returns a line per render of the
// probe.
async function connectTypeAndSend(createStore: CreateStore): Promise<readonly string[]> {
  const { directLine, setStatus } = createDirectLine();
  const lines: string[] = [];
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
    <Composer directLine={directLine as any} store={createStore({})}>
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

  return lines;
}

// Returns the error message of each action that the `dispatch` of card action middleware rejects.
async function rejectByCardActionDispatch(createStore: CreateStore, actions: readonly unknown[]): Promise<string[]> {
  let cardActionDispatch: ((action: unknown) => unknown) | undefined;

  const { unmount } = render(
    <Composer
      cardActionMiddleware={[
        ({ dispatch }) => {
          cardActionDispatch = dispatch;

          return next => next;
        }
      ]}
      directLine={createDirectLine().directLine as any}
      store={createStore({})}
    />
  );

  await waitFor(() => expect(cardActionDispatch).toBeDefined());
  unmount();

  return actions.map(action => {
    try {
      cardActionDispatch(action);
    } catch ({ message }) {
      return message;
    }

    return 'no error';
  });
}

test('on the engine, <Composer> renders the same values, as many times, as on Redux', async () => {
  const reduxLines = await connectTypeAndSend(createStoreWithOptions);

  expect(await connectTypeAndSend(createWebChatEngine)).toEqual(reduxLines);
  expect(reduxLines).toEqual([
    'uninitialized "" []',
    'connected "" []',
    'connected "Hello" []',
    'connected "Hello" [Hello sending]',
    // The echo replaced the activity, before POST_ACTIVITY_FULFILLED marks it sent.
    'connected "Hello" [Hello undefined]',
    'connected "Hello" [Hello sent]'
  ]);
});

test('on the engine, card action middleware gets a dispatch that checks actions as Redux does', async () => {
  // An async action creator without thunk middleware dispatches a Promise.
  const actions = [{}, { type: 1 }, () => undefined, Promise.resolve({ type: 'WEB_CHAT/SET_SEND_BOX' })];
  const reduxMessages = await rejectByCardActionDispatch(createStoreWithOptions, actions);

  expect(await rejectByCardActionDispatch(createWebChatEngine, actions)).toEqual(reduxMessages);
  expect(reduxMessages.map(message => message.split('. ').slice(0, 2).join('. '))).toEqual([
    'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.',
    'Action "type" property must be a string. Instead, the actual type was: \'number\'',
    "Actions must be plain objects. Instead, the actual type was: 'function'",
    "Actions must be plain objects. Instead, the actual type was: 'Promise'"
  ]);
});
