/** @jest-environment @happy-dom/jest-environment */

import 'core-js/features/set/index.js';

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ActivityLogicalGroupingComposer from './ActivityLogicalGroupingComposer';
import {
  useActivityLogicalGroupingContext,
  type ActivityLogicalGroupingContextType
} from './private/ActivityLogicalGroupingContext';

function ContextReader({ contexts }: { readonly contexts: ActivityLogicalGroupingContextType[] }) {
  contexts.push(useActivityLogicalGroupingContext());

  return null;
}

const COLLAPSED = Object.freeze({ isCollapsed: true });
const EXPANDED = Object.freeze({ isCollapsed: false });

scenario(
  'ActivityLogicalGroupingComposer notifies only the keys that changed',
  bdd => {
    bdd
      .given('listeners for activities "a" and "b" and for group "g"', () => {
        const contexts: ActivityLogicalGroupingContextType[] = [];

        act(() => {
          render(
            <ActivityLogicalGroupingComposer>
              <ContextReader contexts={contexts} />
            </ActivityLogicalGroupingComposer>,
            document.createElement('div')
          );
        });

        const listeners = { a: JestGlobals.jest.fn(), b: JestGlobals.jest.fn(), g: JestGlobals.jest.fn() };

        // The context never changes after the first render.
        const [context] = contexts;

        context.subscribeLogicalGroupKey('a', listeners.a);
        context.subscribeLogicalGroupKey('b', listeners.b);
        context.subscribeGroupState('g', listeners.g);

        return { context, listeners };
      })
      .when('group "g" is added with "a"', ({ context }) => {
        context.addLogicalGrouping({ activityKeys: ['a'], groupState: EXPANDED, key: 'g' });
      })
      .then('"a" and "g" should be notified, not "b"', ({ listeners }) => {
        expect(listeners.a).toHaveBeenCalledTimes(1);
        expect(listeners.b).not.toHaveBeenCalled();
        expect(listeners.g).toHaveBeenCalledTimes(1);
      })
      .when('group "g" is updated with "b" added, same state', ({ context, listeners }) => {
        Object.values(listeners).forEach(listener => listener.mockClear());

        context.addLogicalGrouping({ activityKeys: ['a', 'b'], groupState: EXPANDED, key: 'g' });
      })
      .then('only "b" should be notified', ({ listeners }) => {
        expect(listeners.a).not.toHaveBeenCalled();
        expect(listeners.b).toHaveBeenCalledTimes(1);
        expect(listeners.g).not.toHaveBeenCalled();
      })
      .when('group "g" collapses', ({ context, listeners }) => {
        Object.values(listeners).forEach(listener => listener.mockClear());

        context.addLogicalGrouping({ activityKeys: ['a', 'b'], groupState: COLLAPSED, key: 'g' });
      })
      .then('only "g" should be notified', ({ listeners }) => {
        expect(listeners.a).not.toHaveBeenCalled();
        expect(listeners.b).not.toHaveBeenCalled();
        expect(listeners.g).toHaveBeenCalledTimes(1);
      })
      .when('"a" moves from group "g" to group "h"', ({ context, listeners }) => {
        Object.values(listeners).forEach(listener => listener.mockClear());

        context.addLogicalGrouping({ activityKeys: ['a'], groupState: EXPANDED, key: 'h' });
      })
      .then('only "a" should be notified, and its group key should read "h"', ({ context, listeners }) => {
        expect(listeners.a).toHaveBeenCalledTimes(1);
        expect(listeners.b).not.toHaveBeenCalled();
        expect(listeners.g).not.toHaveBeenCalled();
        expect(context.getLogicalGroupKey('a')).toBe('h');
      })
      .when('group "g" is removed', ({ context, listeners }) => {
        Object.values(listeners).forEach(listener => listener.mockClear());

        context.removeLogicalGrouping('g');
      })
      .then('"b" and "g" should be notified, "a" should stay in "h"', ({ context, listeners }) => {
        expect(listeners.a).not.toHaveBeenCalled(); // "a" moved to "h" before "g" was removed.
        expect(listeners.b).toHaveBeenCalledTimes(1);
        expect(listeners.g).toHaveBeenCalledTimes(1);
        expect(context.getLogicalGroupKey('a')).toBe('h');
        expect(context.getLogicalGroupKey('b')).toBeUndefined();
      });
  },
  JestGlobals
);
