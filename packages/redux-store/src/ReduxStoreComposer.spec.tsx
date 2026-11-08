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
import React, { useEffect } from 'react';
import { object, parse, string } from 'valibot';

import ReduxStoreComposer from './ReduxStoreComposer';
import SuggestedActionsComposer from './suggestedActions/SuggestedActionsComposer';
import useSuggestedActionsHooks from './suggestedActions/useSuggestedActionsHooks';

type SuggestedActionsState = ReturnType<ReturnType<typeof useSuggestedActionsHooks>['useSuggestedActions']>;

const CARD_ACTIONS: readonly DirectLineCardAction[] = Object.freeze([
  Object.freeze({ title: 'Hello', type: 'imBack', value: 'Hello' } satisfies DirectLineCardAction)
]);

const ORIGIN_ACTIVITY = parse(
  object({}),
  Object.freeze({ channelData: {}, from: { id: 'bot', role: 'bot' }, id: 'a-1', type: 'message' })
) as WebChatActivity;

function lastOf<T>(array: readonly T[]): T {
  const value = array.at(-1);

  if (typeof value === 'undefined') {
    throw new Error('Nothing recorded.');
  }

  return value;
}

const typeOf = (action: unknown): string => parse(object({ type: string() }), action).type;

function SuggestedActionsProbe({ states }: { readonly states: SuggestedActionsState[] }) {
  states.push(useSuggestedActionsHooks().useSuggestedActions());

  return null;
}

describe('<SuggestedActionsComposer> without a store', () => {
  test('should own the suggested actions', () => {
    const states: SuggestedActionsState[] = [];

    render(
      <SuggestedActionsComposer>
        <SuggestedActionsProbe states={states} />
      </SuggestedActionsComposer>
    );

    expect(lastOf(states)[0]).toEqual([]);

    act(() => lastOf(states)[1](CARD_ACTIONS));

    expect(lastOf(states)[0]).toBe(CARD_ACTIONS);
    expect(lastOf(states)[2]).toEqual({ activity: undefined });
  });
});

describe('<ReduxStoreComposer>', () => {
  function renderWithStore() {
    const actionTypes: string[] = [];
    const states: SuggestedActionsState[] = [];
    const store = createStore({}, () => next => (action: unknown) => {
      actionTypes.push(typeOf(action));

      return next(action);
    });

    function ChildEffect() {
      useEffect(() => {
        store.dispatch({ type: 'TEST/CHILD_EFFECT' });
      }, []);

      return null;
    }

    const result = render(
      <ReduxStoreComposer store={store}>
        <SuggestedActionsProbe states={states} />
        <ChildEffect />
      </ReduxStoreComposer>
    );

    return { actionTypes, result, states, store };
  }

  test('should write to the store first, and register the sink after the effects of its children', () => {
    const { actionTypes, result } = renderWithStore();

    expect(actionTypes).toEqual([
      'WEB_CHAT_INTERNAL/SET_RAW_STATE',
      'WEB_CHAT_INTERNAL/SET_RAW_STATE',
      'TEST/CHILD_EFFECT',
      'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK'
    ]);

    result.unmount();

    expect(lastOf(actionTypes)).toBe('WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK');
  });

  test('should apply suggested actions dispatched to the store', () => {
    const { result, states, store } = renderWithStore();

    act(() => {
      store.dispatch(setSuggestedActions(CARD_ACTIONS, ORIGIN_ACTIVITY));
    });

    expect(lastOf(states)[0]).toEqual(CARD_ACTIONS);
    expect(lastOf(states)[2]).toEqual({ activity: ORIGIN_ACTIVITY });
    expect(store.getState().suggestedActions).toEqual(CARD_ACTIONS);
    expect(store.getState().suggestedActionsOriginActivity).toEqual({ activity: ORIGIN_ACTIVITY });

    act(() => {
      store.dispatch(clearSuggestedActions());
    });

    expect(lastOf(states)[0]).toEqual([]);
    expect(lastOf(states)[2]).toEqual({ activity: undefined });
    expect(store.getState().suggestedActions).toEqual([]);

    result.unmount();
  });

  test('should mirror suggested actions set through the hook to the store', () => {
    const { result, states, store } = renderWithStore();

    act(() => lastOf(states)[1](CARD_ACTIONS));

    expect(store.getState().suggestedActions).toEqual(CARD_ACTIONS);
    expect(store.getState().suggestedActionsOriginActivity).toEqual({ activity: undefined });

    result.unmount();
  });
});
