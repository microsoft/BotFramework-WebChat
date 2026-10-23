/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { memo, useLayoutEffect } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ActivityLogicalGroupingComposer from './ActivityLogicalGroupingComposer';
import useLogicalGroupKey from './useLogicalGroupKey';
import useRemoveLogicalGrouping from './useRemoveLogicalGrouping';
import useSetLogicalGrouping from './useSetLogicalGrouping';

type Renders = { readonly a: (string | undefined)[]; readonly b: (string | undefined)[] };

// Registers like part grouping: set in a layout effect, removed on unmount.
function Group({ activityKeys, groupKey }: { readonly activityKeys: readonly string[]; readonly groupKey: string }) {
  const removeLogicalGrouping = useRemoveLogicalGrouping();
  const setLogicalGrouping = useSetLogicalGrouping();

  useLayoutEffect(() => {
    setLogicalGrouping(groupKey, { activityKeys, isCollapsed: false });
  }, [activityKeys, groupKey, setLogicalGrouping]);

  useLayoutEffect(() => () => removeLogicalGrouping(groupKey), [groupKey, removeLogicalGrouping]);

  return null;
}

function Row({ activityKey, renders }: { readonly activityKey: 'a' | 'b'; readonly renders: Renders }) {
  // eslint-disable-next-line security/detect-object-injection
  renders[activityKey].push(useLogicalGroupKey(activityKey)[0]);

  return null;
}

// Memoized like activities in the transcript, so only its subscription can re-render it.
const MemoizedRow = memo(Row);

// Groups render in the order given, each group key mapped to its activity keys.
function renderGroups(container: HTMLElement, groups: Record<string, readonly string[]>, renders: Renders) {
  renders.a.splice(0);
  renders.b.splice(0);

  act(() => {
    render(
      <ActivityLogicalGroupingComposer>
        <MemoizedRow activityKey="a" renders={renders} />
        <MemoizedRow activityKey="b" renders={renders} />
        {Object.entries(groups).map(([groupKey, activityKeys]) => (
          <Group activityKeys={activityKeys} groupKey={groupKey} key={groupKey} />
        ))}
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
        renderGroups(container, { g: ['a', 'b'] }, renders)
      )
      .then('both activities should be in group "g"', ({ renders }) => {
        // Rendered before the group is set in a layout effect, then re-rendered with the group before paint.
        expect(renders.a).toStrictEqual([undefined, 'g']);
        expect(renders.b).toStrictEqual([undefined, 'g']);
      })
      .when('activity "b" leaves the group', ({ container, renders }) => renderGroups(container, { g: ['a'] }, renders))
      .then('only activity "b" should re-render, without a group', ({ renders }) => {
        expect(renders.a).toStrictEqual([]);
        expect(renders.b).toStrictEqual([undefined]);
      })
      .when('activity "a" moves to group "h", which is set before group "g"', ({ container, renders }) =>
        renderGroups(container, { h: ['a'], g: [] }, renders)
      )
      .then('only activity "a" should re-render once, in group "h"', ({ renders }) => {
        expect(renders.a).toStrictEqual(['h']);
        expect(renders.b).toStrictEqual([]);
      })
      .when('group "g" is removed', ({ container, renders }) => renderGroups(container, { h: ['a'] }, renders))
      .then('activity "a" should not re-render, it stays in group "h"', ({ renders }) =>
        expect(renders.a).toStrictEqual([])
      )
      .when('group "h" is removed', ({ container, renders }) => renderGroups(container, {}, renders))
      .then('activity "a" should re-render once, without a group', ({ renders }) =>
        expect(renders.a).toStrictEqual([undefined])
      );
  },
  JestGlobals
);
