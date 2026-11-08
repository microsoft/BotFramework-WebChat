/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { render } from '@testing-library/react';
import { scenario } from '@testduet/given-when-then';
import React, { memo, useContext, useMemo } from 'react';
import { legacy_createStore as createStore } from 'redux';

import WebChatReduxContext from '../WebChatReduxContext';
import WebChatReduxProvider from '../WebChatReduxProvider';
import { type Source } from './Source';
import useSourceValue from './useSourceValue';

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

// Same as the sources of the Redux bridge: one slice, through the batched subscription of <WebChatReduxProvider>.
function useCountSource(): Source<number> {
  const { store, subscribe } = useContext(WebChatReduxContext);

  return useMemo(() => Object.freeze({ get: () => store.getState().count, subscribe }), [store, subscribe]);
}

scenario(
  'useSourceValue() with sources over <WebChatReduxProvider>',
  bdd => {
    bdd
      .given('a parent and a child reading the same source, the parent passing it down as a prop', () => {
        const renders: (readonly [number, number])[] = [];

        const Child = memo(({ countFromParent }: { readonly countFromParent: number }) => {
          renders.push([countFromParent, useSourceValue(useCountSource())]);

          return null;
        });

        function Parent() {
          return <Child countFromParent={useSourceValue(useCountSource())} />;
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
      .given('a component reading a new array on every call, compared by its content', () => {
        const renders: (readonly number[])[] = [];

        function Counter() {
          const { store, subscribe } = useContext(WebChatReduxContext);

          renders.push(
            useSourceValue(
              useMemo(() => Object.freeze({ get: () => [store.getState().count], subscribe }), [store, subscribe]),
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
      .when('dispatching an action that does not change the value', ({ renders, store }) => {
        store.dispatch({ type: 'INCREMENT_OTHER' });

        return renders;
      })
      .then('should not re-render', (_, renders) => expect(renders).toEqual([[0]]))
      .when('dispatching an action that changes the value', ({ renders, store }) => {
        store.dispatch({ type: 'INCREMENT_COUNT' });

        return renders;
      })
      .then('should re-render once', (_, renders) => expect(renders).toEqual([[0], [1]]));

    bdd
      .given('a component dispatching while rendering', () => {
        const renders: number[] = [];
        const store = createStore(reducer);

        function Counter() {
          renders.push(useSourceValue(useCountSource()));

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

    bdd
      .given('a component reading a source over one store', () => {
        const renders: number[] = [];
        const store1 = createStore(reducer);
        const store2 = createStore(reducer, { count: 10, other: 0 });

        function Counter() {
          renders.push(useSourceValue(useCountSource()));

          return null;
        }

        const result = render(
          <WebChatReduxProvider store={store1}>
            <Counter />
          </WebChatReduxProvider>
        );

        return { Counter, renders, result, store1, store2 };
      })
      .when('the store is swapped, then both stores change', ({ Counter, renders, result, store1, store2 }) => {
        result.rerender(
          <WebChatReduxProvider store={store2}>
            <Counter />
          </WebChatReduxProvider>
        );

        store1.dispatch({ type: 'INCREMENT_COUNT' });
        store2.dispatch({ type: 'INCREMENT_COUNT' });

        return renders;
      })
      .then('should read the new store and follow only the new store', (_, renders) =>
        expect(renders).toEqual([0, 10, 11])
      );
  },
  JestGlobals
);
