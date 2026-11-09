/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { act, render } from '@testing-library/react';
import {
  clearSuggestedActions,
  createStore,
  setSuggestedActions,
  type DirectLineCardAction,
  type WebChatActivity
} from 'botframework-webchat-core';
import React from 'react';
import { object, parse } from 'valibot';

import ReduxStoreComposer from '../ReduxStoreComposer';
import CLEARED_SUGGESTED_ACTIONS from './CLEARED_SUGGESTED_ACTIONS';
import SuggestedActionsComposer from './SuggestedActionsComposer';
import SuggestedActionsSubscriber, { type SuggestedActionsListener } from './SuggestedActionsSubscriber';
import useSuggestedActionsHooks from './useSuggestedActionsHooks';

type SuggestedActionsState = ReturnType<ReturnType<typeof useSuggestedActionsHooks>['useSuggestedActions']>;

const CARD_ACTIONS: readonly DirectLineCardAction[] = Object.freeze([
  Object.freeze({ title: 'Hello', type: 'imBack', value: 'Hello' } satisfies DirectLineCardAction)
]);

const ORIGIN_ACTIVITY = parse(
  object({}),
  Object.freeze({ channelData: {}, from: { id: 'bot', role: 'bot' }, id: 'a-1', type: 'message' })
) as WebChatActivity;

function SuggestedActionsProbe({ states }: { readonly states: SuggestedActionsState[] }) {
  states.push(useSuggestedActionsHooks().useSuggestedActions());

  return null;
}

function lastOf<T>(array: readonly T[]): T {
  const value = array.at(-1);

  if (typeof value === 'undefined') {
    throw new Error('Nothing recorded.');
  }

  return value;
}

// What the incoming activities set: suggested actions with their origin, the same again, then a clear.
const EVENTS: readonly [readonly DirectLineCardAction[], WebChatActivity | undefined][] = [
  [CARD_ACTIONS, ORIGIN_ACTIVITY],
  [CARD_ACTIONS, ORIGIN_ACTIVITY],
  [Object.freeze([]), undefined]
];

test('sets the suggested actions as the Redux mirror does with SET_SUGGESTED_ACTIONS', () => {
  const listeners = new Set<SuggestedActionsListener>();
  const subscribe = (listener: SuggestedActionsListener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const subscriberStates: SuggestedActionsState[] = [];
  const mirrorStates: SuggestedActionsState[] = [];
  const store = createStore();

  const subscriberResult = render(
    <SuggestedActionsComposer>
      <SuggestedActionsSubscriber subscribe={subscribe}>
        <SuggestedActionsProbe states={subscriberStates} />
      </SuggestedActionsSubscriber>
    </SuggestedActionsComposer>
  );

  const mirrorResult = render(
    <ReduxStoreComposer store={store}>
      <SuggestedActionsProbe states={mirrorStates} />
    </ReduxStoreComposer>
  );

  expect(listeners.size).toBe(1);

  for (const [actions, origin] of EVENTS) {
    act(() => listeners.forEach(listener => listener(actions, origin)));
    act(() => {
      store.dispatch(setSuggestedActions(actions, origin));
    });

    expect(subscriberStates).toHaveLength(mirrorStates.length);

    const [subscriberActions, , subscriberOrigin] = lastOf(subscriberStates);
    const [mirrorActions, , mirrorOrigin] = lastOf(mirrorStates);

    expect(subscriberActions).toEqual(mirrorActions);
    expect(Object.isFrozen(subscriberActions)).toBe(Object.isFrozen(mirrorActions));
    expect(subscriberOrigin).toEqual(mirrorOrigin);
    expect(subscriberOrigin.activity).toBe(origin);
  }

  subscriberResult.unmount();
  mirrorResult.unmount();

  expect(listeners.size).toBe(0);
});

test('a clear keeps its array, as the Redux mirror does with CLEAR_SUGGESTED_ACTIONS: no re-render when cleared', () => {
  const listeners = new Set<SuggestedActionsListener>();
  const subscribe = (listener: SuggestedActionsListener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const subscriberStates: SuggestedActionsState[] = [];
  const mirrorStates: SuggestedActionsState[] = [];
  const store = createStore();

  const subscriberResult = render(
    <SuggestedActionsComposer>
      <SuggestedActionsSubscriber subscribe={subscribe}>
        <SuggestedActionsProbe states={subscriberStates} />
      </SuggestedActionsSubscriber>
    </SuggestedActionsComposer>
  );

  const mirrorResult = render(
    <ReduxStoreComposer store={store}>
      <SuggestedActionsProbe states={mirrorStates} />
    </ReduxStoreComposer>
  );

  const numRenders: [number, number][] = [];

  // Clear, clear again, set, clear, clear again.
  for (const actions of [undefined, undefined, CARD_ACTIONS, undefined, undefined]) {
    const before: [number, number] = [subscriberStates.length, mirrorStates.length];

    act(() =>
      listeners.forEach(listener =>
        actions ? listener(actions, ORIGIN_ACTIVITY) : listener(CLEARED_SUGGESTED_ACTIONS, undefined)
      )
    );
    act(() => {
      store.dispatch(actions ? setSuggestedActions(actions, ORIGIN_ACTIVITY) : clearSuggestedActions());
    });

    numRenders.push([subscriberStates.length - before[0], mirrorStates.length - before[1]]);

    actions || expect(lastOf(subscriberStates)[0]).toBe(CLEARED_SUGGESTED_ACTIONS);
    actions || expect(lastOf(mirrorStates)[0]).toBe(CLEARED_SUGGESTED_ACTIONS);
  }

  // The same renders on both sides, and none for a clear when already cleared.
  expect(numRenders.map(([subscriber]) => subscriber)).toEqual(numRenders.map(([, mirror]) => mirror));
  expect(numRenders.map(([subscriber]) => subscriber > 0)).toEqual([true, false, true, true, false]);

  subscriberResult.unmount();
  mirrorResult.unmount();
});
