/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { Fragment, memo, useLayoutEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import createKeyedStore, { type KeyedStore } from './createKeyedStore';
import useKeyedStoreValue from './useKeyedStoreValue';

type Renders = { readonly a: (string | undefined)[]; readonly b: (string | undefined)[] };

function Reader({
  renders,
  store,
  valueKey
}: {
  readonly renders: Renders;
  readonly store: KeyedStore<string>;
  readonly valueKey: 'a' | 'b';
}) {
  // eslint-disable-next-line security/detect-object-injection
  renders[valueKey].push(useKeyedStoreValue(store, valueKey)[0]);

  return null;
}

// Memoized like activities in the transcript, so only its subscription can re-render it.
const MemoizedReader = memo(Reader);

// Placed before `<Reader>`: its layout effect runs after `<Reader>` rendered and before `<Reader>` subscribes.
function SetOnMount({
  store,
  value,
  valueKey
}: {
  readonly store: KeyedStore<string>;
  readonly value: string;
  readonly valueKey: string;
}) {
  useLayoutEffect(() => store.set(valueKey, value), [store, value, valueKey]);

  return null;
}

scenario(
  'useKeyedStoreValue',
  bdd => {
    bdd
      .given('readers of "a" and "b"', () => {
        const container = document.createElement('div');
        const renders: Renders = { a: [], b: [] };
        const store = createKeyedStore<string>();

        act(() => {
          render(
            <Fragment>
              <MemoizedReader renders={renders} store={store} valueKey="a" />
              <MemoizedReader renders={renders} store={store} valueKey="b" />
            </Fragment>,
            container
          );
        });

        return { container, renders, store };
      })
      .when('"a" is set', ({ store }) => {
        act(() => store.set('a', '1'));
      })
      .then('only the reader of "a" should re-render', ({ renders }) => {
        expect(renders.a).toStrictEqual([undefined, '1']);
        expect(renders.b).toStrictEqual([undefined]);
      })
      .when('"a" is set to the same value', ({ store }) => {
        act(() => store.set('a', '1'));
      })
      .then('the reader of "a" should not re-render', ({ renders }) =>
        expect(renders.a).toStrictEqual([undefined, '1'])
      )
      .when('"a" is deleted', ({ store }) => {
        act(() => store.delete('a'));
      })
      .then('the reader of "a" should re-render without a value', ({ renders }) =>
        expect(renders.a).toStrictEqual([undefined, '1', undefined])
      )
      .when('the readers unmount and "a" is set', ({ container, store }) => {
        act(() => {
          unmountComponentAtNode(container);
        });

        act(() => store.set('a', '2'));
      })
      .then('the reader of "a" should not render again, it unsubscribed', ({ renders }) =>
        expect(renders.a).toStrictEqual([undefined, '1', undefined])
      );

    bdd
      .given('a store', () => ({ renders: { a: [], b: [] } as Renders, store: createKeyedStore<string>() }))
      .when('"a" is set after the reader rendered, before it subscribed', ({ renders, store }) => {
        act(() => {
          render(
            <Fragment>
              <SetOnMount store={store} value="missed" valueKey="a" />
              <MemoizedReader renders={renders} store={store} valueKey="a" />
            </Fragment>,
            document.createElement('div')
          );
        });
      })
      .then('the reader should re-render with the missed value', ({ renders }) =>
        expect(renders.a).toStrictEqual([undefined, 'missed'])
      );

    bdd
      .given('a reader of "a", "a" is "1" and "b" is "2"', () => {
        const container = document.createElement('div');
        const renders: Renders = { a: [], b: [] };
        const store = createKeyedStore<string>();

        store.set('a', '1');
        store.set('b', '2');

        // `{false}` keeps the reader at the same position as in the next render, so it updates instead of remounting.
        act(() => {
          render(
            <Fragment>
              {false}
              <MemoizedReader renders={renders} store={store} valueKey="a" />
            </Fragment>,
            container
          );
        });

        return { container, renders, store };
      })
      .when(
        'the reader switches to "b" as "b" changes to "1" before it subscribes',
        ({ container, renders, store }) => {
          act(() => {
            render(
              <Fragment>
                <SetOnMount store={store} value="1" valueKey="b" />
                <MemoizedReader renders={renders} store={store} valueKey="b" />
              </Fragment>,
              container
            );
          });
        }
      )
      .then('the reader should re-render with "1", the new value of "b"', ({ renders }) =>
        // Rendered "2" first, then "1" after the re-check, although "1" is also the value it rendered for "a".
        expect(renders.b).toStrictEqual(['2', '1'])
      )
      .when('"a" is set', ({ store }) => {
        act(() => store.set('a', '3'));
      })
      .then('the reader should not re-render, it unsubscribed from "a"', ({ renders }) =>
        expect(renders.b).toStrictEqual(['2', '1'])
      );
  },
  JestGlobals
);
