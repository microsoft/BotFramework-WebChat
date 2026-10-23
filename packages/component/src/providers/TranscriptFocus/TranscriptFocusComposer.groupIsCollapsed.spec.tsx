/** @jest-environment @happy-dom/jest-environment */
/* eslint no-magic-numbers: "off" */

import 'core-js/features/set/index.js';

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { useContext } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import usePartGroupingLogicalGroup from '../../Middleware/ActivityGrouping/ui/PartGrouping/private/usePartGroupingLogicalGroup';
import { ActivityLogicalGroupingComposer } from '../ActivityLogicalGrouping';
import useRenderingActivityKeys from '../RenderingActivities/useRenderingActivityKeys';
import TranscriptFocusContext, { type TranscriptFocusContextType } from './private/Context';
import TranscriptFocusComposer from './TranscriptFocusComposer';

jest.mock('../../Utils/scrollIntoViewWithBlockNearest', () => jest.fn());
jest.mock('../RenderingActivities/useRenderingActivityKeys');

// Every render pushes its values, the last one is current.
type Result = { readonly contexts: TranscriptFocusContextType[]; readonly groupKeys: string[] };

// Activity "c" follows the part group with "a" and "b".
const ACTIVITY_KEYS = Object.freeze(['a', 'b', 'c']);
const GROUP_ACTIVITY_KEYS = Object.freeze(['a', 'b']);

function PartGroup({ isCollapsed, result }: { readonly isCollapsed: boolean; readonly result: Result }) {
  result.groupKeys.push(usePartGroupingLogicalGroup({ activityKeys: GROUP_ACTIVITY_KEYS, isCollapsed }));

  return null;
}

function ContextReader({ result }: { readonly result: Result }) {
  result.contexts.push(useContext(TranscriptFocusContext));

  return null;
}

function renderTranscript(container: HTMLElement, isCollapsed: boolean, result: Result) {
  act(() => {
    render(
      <ActivityLogicalGroupingComposer>
        <TranscriptFocusComposer containerRef={{ current: container }}>
          <PartGroup isCollapsed={isCollapsed} result={result} />
          <ContextReader result={result} />
        </TranscriptFocusComposer>
      </ActivityLogicalGroupingComposer>,
      container
    );
  });
}

function getFocusedId({ contexts }: Result): string | undefined {
  const context = contexts.at(-1);

  return (context?.activeGroupDescendantIdState[0] || context?.activeDescendantIdState[0])?.replace(
    /^webchat__transcript-focus-[^_]+__/u,
    ''
  );
}

scenario(
  'TranscriptFocusComposer reads whether the group is collapsed while handling a key press',
  bdd => {
    bdd
      .given('a transcript with an expanded part group followed by activity "c"', () => {
        jest.mocked(useRenderingActivityKeys).mockReturnValue(Object.freeze([ACTIVITY_KEYS]));

        const container = document.createElement('div');
        const result: Result = { contexts: [], groupKeys: [] };

        renderTranscript(container, false, result);

        return { container, result };
      })
      .when('pressing up from activity "c"', ({ result }) => {
        act(() => result.contexts.at(-1)?.focusRelativeActivity(-1));
      })
      .then('activity "b" should be focused, inside the expanded group', ({ result }) =>
        expect(getFocusedId(result)).toBe('activity-b')
      )
      .when('the group collapses and pressing up from activity "c" again', ({ container, result }) => {
        renderTranscript(container, true, result);

        act(() => result.contexts.at(-1)?.focusByActivityKey('c', false));
        act(() => result.contexts.at(-1)?.focusRelativeActivity(-1));
      })
      .then('the collapsed group should be focused', ({ result }) =>
        expect(getFocusedId(result)).toBe(`group-${result.groupKeys.at(-1)}`)
      );
  },
  JestGlobals
);
