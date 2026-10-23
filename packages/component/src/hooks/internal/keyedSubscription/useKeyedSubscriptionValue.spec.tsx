/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { Fragment, memo, useLayoutEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import createKeyedSubscription, { type KeyedSubscription } from './createKeyedSubscription';
import useKeyedSubscriptionValue from './useKeyedSubscriptionValue';

type Store = {
  readonly getValue: (key: string) => string | undefined;
  readonly renders: { readonly a: (string | undefined)[]; readonly b: (string | undefined)[] };
  readonly subscription: KeyedSubscription<string>;
  readonly values: Map<string, string>;
};

function createStore(): Store {
  const values = new Map<string, string>();

  return {
    getValue: key => values.get(key),
    renders: { a: [], b: [] },
    subscription: createKeyedSubscription(),
    values
  };
}

function Reader({ store, valueKey }: { readonly store: Store; readonly valueKey: 'a' | 'b' }) {
  // eslint-disable-next-line security/detect-object-injection
  store.renders[valueKey].push(useKeyedSubscriptionValue(store.subscription.subscribe, valueKey, store.getValue)[0]);

  return null;
}

// Memoized like activities in the transcript, so only its subscription can re-render it.
const MemoizedReader = memo(Reader);

// Placed before `<Reader>`: its layout effect runs after `<Reader>` rendered and before `<Reader>` subscribes.
// Changes "a" without notifying, so only the re-check after subscribing can see it.
function SetValueBeforeSubscribe({ store }: { readonly store: Store }) {
  useLayoutEffect(() => {
    store.values.set('a', 'missed');
  }, [store]);

  return null;
}

scenario(
  'useKeyedSubscriptionValue',
  bdd => {
    bdd
      .given('readers of "a" and "b"', () => {
        const container = document.createElement('div');
        const store = createStore();

        act(() => {
          render(
            <Fragment>
              <MemoizedReader store={store} valueKey="a" />
              <MemoizedReader store={store} valueKey="b" />
            </Fragment>,
            container
          );
        });

        return { container, store };
      })
      .when('"a" changes and is notified', ({ store }) => {
        store.values.set('a', '1');

        act(() => store.subscription.notify(['a']));
      })
      .then('only the reader of "a" should re-render', ({ store }) => {
        expect(store.renders.a).toStrictEqual([undefined, '1']);
        expect(store.renders.b).toStrictEqual([undefined]);
      })
      .when('"b" is notified without a change', ({ store }) => {
        act(() => store.subscription.notify(['b']));
      })
      .then('the reader of "b" should not re-render', ({ store }) => expect(store.renders.b).toStrictEqual([undefined]))
      .when('the readers unmount and "a" changes and is notified', ({ container, store }) => {
        act(() => {
          unmountComponentAtNode(container);
        });

        store.values.set('a', '2');

        act(() => store.subscription.notify(['a']));
      })
      .then('the reader of "a" should not render again, it unsubscribed', ({ store }) =>
        expect(store.renders.a).toStrictEqual([undefined, '1'])
      );

    bdd
      .given('a store', () => ({ container: document.createElement('div'), store: createStore() }))
      .when('"a" changes after the reader rendered, before it subscribed', ({ container, store }) => {
        act(() => {
          render(
            <Fragment>
              <SetValueBeforeSubscribe store={store} />
              <MemoizedReader store={store} valueKey="a" />
            </Fragment>,
            container
          );
        });
      })
      .then('the reader should re-render with the missed value', ({ store }) =>
        expect(store.renders.a).toStrictEqual([undefined, 'missed'])
      );

    bdd
      .given('a reader of "a", "a" is "1" and "b" is "2"', () => {
        const container = document.createElement('div');
        const store = createStore();

        store.values.set('a', '1');
        store.values.set('b', '2');

        act(() => {
          render(<MemoizedReader store={store} valueKey="a" />, container);
        });

        return { container, store };
      })
      .when('the reader switches to "b"', ({ container, store }) => {
        act(() => {
          render(<MemoizedReader store={store} valueKey="b" />, container);
        });
      })
      .then('the reader should render "2" from its first render with "b"', ({ store }) => {
        expect(store.renders.a).toStrictEqual(['1']);
        // Re-renders once: its state holds "1" until the re-check after subscribing to "b".
        expect(store.renders.b).toStrictEqual(['2', '2']);
      })
      .when('"a" changes and is notified', ({ store }) => {
        store.values.set('a', '3');

        act(() => store.subscription.notify(['a']));
      })
      .then('the reader should not re-render, it unsubscribed from "a"', ({ store }) =>
        expect(store.renders.b).toStrictEqual(['2', '2'])
      )
      .when('"b" changes and is notified', ({ store }) => {
        store.values.set('b', '4');

        act(() => store.subscription.notify(['b']));
      })
      .then('the reader should re-render with the new value of "b"', ({ store }) =>
        expect(store.renders.b).toStrictEqual(['2', '2', '4'])
      );

    bdd
      .given('a reader of a value which is a function', () => {
        const container = document.createElement('div');
        const renders: (() => void)[] = [];
        const subscription = createKeyedSubscription<string>();
        const values = { current: JestGlobals.jest.fn() };
        const getValue = () => values.current;

        function FunctionReader() {
          renders.push(useKeyedSubscriptionValue(subscription.subscribe, 'a', getValue)[0]);

          return null;
        }

        act(() => {
          render(<FunctionReader />, container);
        });

        return { initialValue: values.current, renders, subscription, values };
      })
      .when('the value changes to another function and is notified', ({ subscription, values }) => {
        values.current = JestGlobals.jest.fn();

        act(() => subscription.notify(['a']));
      })
      .then('the reader should re-render with the new function', ({ initialValue, renders, values }) =>
        expect(renders).toStrictEqual([initialValue, values.current])
      )
      .and('neither function should be called, they are values, not state updaters', ({ initialValue, values }) => {
        expect(initialValue).not.toHaveBeenCalled();
        expect(values.current).not.toHaveBeenCalled();
      });
  },
  JestGlobals
);
