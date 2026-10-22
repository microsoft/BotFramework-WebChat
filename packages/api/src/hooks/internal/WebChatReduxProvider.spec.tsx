/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { render } from '@testing-library/react';
import { scenario } from '@testduet/given-when-then';
import React, { memo } from 'react';
import { legacy_createStore as createStore } from 'redux';

import { useSelector } from './WebChatReduxContext';
import WebChatReduxProvider from './WebChatReduxProvider';

type State = { readonly count: number; readonly other: number };

function reducer(
  state: State = { count: 0, other: 0 },
  { payload, type }: { payload?: number | undefined; type: string }
): State {
  return type === 'INCREMENT_COUNT'
    ? { ...state, count: state.count + 1 }
    : type === 'INCREMENT_OTHER'
      ? { ...state, other: state.other + 1 }
      : type === 'SET_COUNT'
        ? { ...state, count: payload }
        : state;
}

scenario(
  'useSelector() under <WebChatReduxProvider>',
  bdd => {
    bdd
      .given('a parent and a child selecting the same value, the parent passing it down as a prop', () => {
        const renders: (readonly [number, number])[] = [];

        const Child = memo(({ countFromParent }: { readonly countFromParent: number }) => {
          renders.push([countFromParent, useSelector(({ count }: State) => count)]);

          return null;
        });

        function Parent() {
          return <Child countFromParent={useSelector(({ count }: State) => count)} />;
        }

        const store = createStore(reducer);

        render(
          <WebChatReduxProvider store={store}>
            <Parent />
          </WebChatReduxProvider>
        );

        return { renders, store };
      })
      .when('dispatching outside of React', ({ renders, store }) => {
        // Outside of act(), which would batch the updates by itself.
        store.dispatch({ type: 'INCREMENT_COUNT' });

        return renders;
      })
      // Without batching, React 16 would re-render the child first, with a stale prop: [0, 1].
      .then('the child should re-render once, together with its parent', (_, renders) =>
        expect(renders).toEqual([
          [0, 0],
          [1, 1]
        ])
      );

    bdd
      .given('a component selecting a new array on every call, compared by its content', () => {
        const renders: (readonly number[])[] = [];

        function Counter() {
          renders.push(
            useSelector(
              ({ count }: State) => [count],
              ([x], [y]) => x === y
            )
          );

          return null;
        }

        const store = createStore(reducer);

        render(
          <WebChatReduxProvider store={store}>
            <Counter />
          </WebChatReduxProvider>
        );

        return { renders, store };
      })
      .when('dispatching an action that does not change the selected value', ({ renders, store }) => {
        store.dispatch({ type: 'INCREMENT_OTHER' });

        return renders;
      })
      .then('should not re-render', (_, renders) => expect(renders).toEqual([[0]]))
      .when('dispatching an action that changes the selected value', ({ renders, store }) => {
        store.dispatch({ type: 'INCREMENT_COUNT' });

        return renders;
      })
      .then('should re-render once', (_, renders) => expect(renders).toEqual([[0], [1]]));

    bdd
      .given('a component dispatching while rendering', () => {
        const renders: number[] = [];
        const store = createStore(reducer);

        function Counter() {
          renders.push(useSelector(({ count }: State) => count));

          // Dispatches on every render, like calling the setter of `useSendBoxValue()` in render.
          store.dispatch({ payload: 1, type: 'SET_COUNT' });

          return null;
        }

        return { Counter, renders, store };
      })
      .when('rendered', ({ Counter, renders, store }) => {
        render(
          <WebChatReduxProvider store={store}>
            <Counter />
          </WebChatReduxProvider>
        );

        return renders;
      })
      .then('should re-render once with the new value, instead of re-rendering in a loop', (_, renders) =>
        expect(renders).toEqual([0, 1])
      );
  },
  JestGlobals
);
