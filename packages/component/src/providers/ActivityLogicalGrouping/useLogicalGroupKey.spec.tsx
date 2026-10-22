/** @jest-environment @happy-dom/jest-environment */

import 'core-js/features/set/index.js';

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { memo, useLayoutEffect } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ActivityLogicalGroupingComposer from './ActivityLogicalGroupingComposer';
import useAddLogicalGrouping from './useAddLogicalGrouping';
import useLogicalGroupKey from './useLogicalGroupKey';

type Renders = { readonly a: (string | undefined)[]; readonly b: (string | undefined)[] };

function Group({ activityKeys }: { readonly activityKeys: string[] }) {
  const addLogicalGrouping = useAddLogicalGrouping();

  useLayoutEffect(() => {
    addLogicalGrouping({ activityKeys, key: 'g' });
  }, [activityKeys, addLogicalGrouping]);

  return null;
}

function Row({ activityKey, renders }: { readonly activityKey: 'a' | 'b'; readonly renders: Renders }) {
  // eslint-disable-next-line security/detect-object-injection
  renders[activityKey].push(useLogicalGroupKey(activityKey)[0]);

  return null;
}

// Memoized like activities in the transcript, so only its subscription can re-render it.
const MemoizedRow = memo(Row);

function renderGroup(container: HTMLElement, activityKeys: string[], renders: Renders) {
  act(() => {
    render(
      <ActivityLogicalGroupingComposer>
        <MemoizedRow activityKey="a" renders={renders} />
        <MemoizedRow activityKey="b" renders={renders} />
        <Group activityKeys={activityKeys} />
      </ActivityLogicalGroupingComposer>,
      container
    );
  });
}

scenario(
  'useLogicalGroupKey',
  bdd => {
    bdd
      .given('an empty transcript', () => ({ container: document.createElement('div'), renders: { a: [], b: [] } }))
      .when('activities "a" and "b" are added to group "g"', ({ container, renders }) =>
        renderGroup(container, ['a', 'b'], renders)
      )
      .then('both activities should be in group "g"', ({ renders }) => {
        // Rendered before the group is added in a layout effect, then re-rendered with the group before paint.
        expect(renders.a).toStrictEqual([undefined, 'g']);
        expect(renders.b).toStrictEqual([undefined, 'g']);
      })
      .when('activity "b" leaves the group', ({ container, renders }) => {
        renders.a.splice(0);
        renders.b.splice(0);

        renderGroup(container, ['a'], renders);
      })
      .then('activity "a" should not re-render, its group did not change', ({ renders }) =>
        expect(renders.a).toStrictEqual([])
      )
      .and('activity "b" should re-render once, without a group', ({ renders }) =>
        expect(renders.b).toStrictEqual([undefined])
      );
  },
  JestGlobals
);
