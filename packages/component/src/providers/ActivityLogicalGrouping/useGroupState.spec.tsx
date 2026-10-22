/** @jest-environment @happy-dom/jest-environment */

import 'core-js/features/set/index.js';

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { memo } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import usePartGroupingLogicalGroup from '../../Middleware/ActivityGrouping/ui/PartGrouping/private/usePartGroupingLogicalGroup';
import ActivityLogicalGroupingComposer from './ActivityLogicalGroupingComposer';
import { type GroupState } from './private/ActivityLogicalGroupingContext';
import useGroupState from './useGroupState';

type Renders = (GroupState | undefined)[];

function Reader({ groupKey, renders }: { readonly groupKey: string; readonly renders: Renders }) {
  renders.push(useGroupState(groupKey)[0]);

  return null;
}

// Memoized like activities in the transcript, so only its subscription can re-render it.
const MemoizedReader = memo(Reader);

function PartGroup({
  activityKeys,
  isCollapsed,
  renders
}: {
  readonly activityKeys: readonly string[];
  readonly isCollapsed: boolean;
  readonly renders: Renders;
}) {
  const groupKey = usePartGroupingLogicalGroup({ activityKeys, isCollapsed });

  return <MemoizedReader groupKey={groupKey} renders={renders} />;
}

const ACTIVITY_KEYS_1 = Object.freeze(['a']);
const ACTIVITY_KEYS_2 = Object.freeze(['b']);

function renderGroups(
  container: HTMLElement,
  { isGroup1Collapsed, renders1, renders2 }: { isGroup1Collapsed: boolean; renders1: Renders; renders2: Renders }
) {
  act(() => {
    render(
      <ActivityLogicalGroupingComposer>
        <PartGroup activityKeys={ACTIVITY_KEYS_1} isCollapsed={isGroup1Collapsed} renders={renders1} />
        <PartGroup activityKeys={ACTIVITY_KEYS_2} isCollapsed={false} renders={renders2} />
      </ActivityLogicalGroupingComposer>,
      container
    );
  });
}

scenario(
  'useGroupState',
  bdd => {
    bdd
      .given('an empty transcript', (): { container: HTMLElement; renders1: Renders; renders2: Renders } => ({
        container: document.createElement('div'),
        renders1: [],
        renders2: []
      }))
      .when('two expanded part groups are added', ({ container, renders1, renders2 }) =>
        renderGroups(container, { isGroup1Collapsed: false, renders1, renders2 })
      )
      .then('both readers should see an expanded group', ({ renders1, renders2 }) => {
        // Rendered before the group is added in a layout effect, then re-rendered with its state before paint.
        expect(renders1).toStrictEqual([undefined, { isCollapsed: false }]);
        expect(renders2).toStrictEqual([undefined, { isCollapsed: false }]);
      })
      .when('group 1 collapses', ({ container, renders1, renders2 }) => {
        renders1.splice(0);
        renders2.splice(0);

        renderGroups(container, { isGroup1Collapsed: true, renders1, renders2 });
      })
      .then('group 1 reader should re-render once, collapsed', ({ renders1 }) =>
        expect(renders1).toStrictEqual([{ isCollapsed: true }])
      )
      .and('group 2 reader should not re-render, its group did not change', ({ renders2 }) =>
        expect(renders2).toStrictEqual([])
      )
      .when('group 1 expands', ({ container, renders1, renders2 }) => {
        renders1.splice(0);
        renders2.splice(0);

        renderGroups(container, { isGroup1Collapsed: false, renders1, renders2 });
      })
      .then('group 1 reader should re-render once, expanded', ({ renders1 }) =>
        expect(renders1).toStrictEqual([{ isCollapsed: false }])
      )
      .and('group 2 reader should not re-render', ({ renders2 }) => expect(renders2).toStrictEqual([]));
  },
  JestGlobals
);
