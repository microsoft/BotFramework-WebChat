/** @jest-environment @happy-dom/jest-environment */

import 'core-js/features/set/index.js';

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { Fragment, memo } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import createKeyedSubscription from '../../hooks/internal/keyedSubscription/createKeyedSubscription';
import { ActivityLogicalGroupingComposer } from '../ActivityLogicalGrouping';
import useRenderingActivityKeys from '../RenderingActivities/useRenderingActivityKeys';
import TranscriptFocusContext, { type TranscriptFocusContextType } from './private/Context';
import TranscriptFocusComposer from './TranscriptFocusComposer';
import useGroupDescendantIdByGroupKey from './useGroupDescendantIdByGroupKey';

jest.mock('../RenderingActivities/useRenderingActivityKeys');

// Every render pushes its value, by group key.
type Renders = Map<string | undefined, (string | undefined)[]>;

function Reader({ groupKey, renders }: { readonly groupKey: string | undefined; readonly renders: Renders }) {
  const [id] = useGroupDescendantIdByGroupKey(groupKey);

  renders.set(groupKey, [...(renders.get(groupKey) ?? []), id]);

  return null;
}

// Memoized like activities in the transcript, so only its subscription or the context can re-render it.
const MemoizedReader = memo(Reader);

function Readers({ renders }: { readonly renders: Renders }) {
  return (
    <Fragment>
      <MemoizedReader groupKey="g1" renders={renders} />
      <MemoizedReader groupKey="g2" renders={renders} />
      <MemoizedReader groupKey={undefined} renders={renders} />
    </Fragment>
  );
}

scenario(
  'useGroupDescendantIdByGroupKey under <TranscriptFocusComposer>',
  bdd => {
    bdd
      .given('an empty transcript', () => {
        jest.mocked(useRenderingActivityKeys).mockReturnValue(Object.freeze([Object.freeze([])]));

        return { container: document.createElement('div'), renders: new Map() as Renders };
      })
      .when('readers of "g1", "g2", and no group render', ({ container, renders }) => {
        act(() => {
          render(
            <ActivityLogicalGroupingComposer>
              <TranscriptFocusComposer containerRef={{ current: container }}>
                <Readers renders={renders} />
              </TranscriptFocusComposer>
            </ActivityLogicalGroupingComposer>,
            container
          );
        });
      })
      .then('each reader should render its group ID once', ({ renders }) => {
        // The composer notifies every group on mount, which does not re-render: the IDs did not change.
        expect(renders.get('g1')).toEqual([expect.stringMatching(/^webchat__transcript-focus-[^_]+__group-g1$/u)]);
        expect(renders.get('g2')).toEqual([expect.stringMatching(/^webchat__transcript-focus-[^_]+__group-g2$/u)]);
      })
      .and('the reader without a group key should render undefined', ({ renders }) =>
        expect(renders.get(undefined)).toStrictEqual([undefined])
      );
  },
  JestGlobals
);

scenario(
  'useGroupDescendantIdByGroupKey with a notified change',
  bdd => {
    bdd
      .given('readers of "g1", "g2", and no group, with a context which notifies changed IDs', () => {
        const container = document.createElement('div');
        const ids = new Map([
          ['g1', 'id-1'],
          ['g2', 'id-2']
        ]);
        const renders: Renders = new Map();
        const subscription = createKeyedSubscription<string | undefined>();

        // Only what the hook reads: the getter and the subscription.
        const context = Object.freeze({
          getGroupDescendantIdByGroupKey: (groupKey?: string) => ids.get(groupKey),
          subscribeGroupDescendantId: subscription.subscribe
        }) satisfies Pick<
          TranscriptFocusContextType,
          'getGroupDescendantIdByGroupKey' | 'subscribeGroupDescendantId'
        > as TranscriptFocusContextType;

        act(() => {
          render(
            <TranscriptFocusContext.Provider value={context}>
              <Readers renders={renders} />
            </TranscriptFocusContext.Provider>,
            container
          );
        });

        return { ids, renders, subscription };
      })
      .when('the ID of "g2" changes and every group is notified', ({ ids, subscription }) => {
        ids.set('g2', 'id-2b');

        act(() => subscription.notifyAll());
      })
      .then('only the reader of "g2" should re-render, with the new ID', ({ renders }) => {
        expect(renders.get('g1')).toStrictEqual(['id-1']);
        expect(renders.get('g2')).toStrictEqual(['id-2', 'id-2b']);
        expect(renders.get(undefined)).toStrictEqual([undefined]);
      })
      .when('the ID of "g1" changes and only "g1" is notified', ({ ids, subscription }) => {
        ids.set('g1', 'id-1b');

        act(() => subscription.notify(['g1']));
      })
      .then('only the reader of "g1" should re-render, with the new ID', ({ renders }) => {
        expect(renders.get('g1')).toStrictEqual(['id-1', 'id-1b']);
        expect(renders.get('g2')).toStrictEqual(['id-2', 'id-2b']);
        expect(renders.get(undefined)).toStrictEqual([undefined]);
      });
  },
  JestGlobals
);
