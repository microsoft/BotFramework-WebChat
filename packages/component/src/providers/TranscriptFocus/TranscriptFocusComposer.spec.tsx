/** @jest-environment @happy-dom/jest-environment */
/* eslint-disable security/detect-object-injection */
/* eslint no-magic-numbers: "off" */

import React, { useContext, useMemo } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import TranscriptFocusComposer from './TranscriptFocusComposer';
import TranscriptFocusContext, { TranscriptFocusContextType } from './private/Context';
import { ActivityLogicalGroupingComposer, useAddLogicalGrouping } from '../ActivityLogicalGrouping';

// Mock dependencies
jest.mock('../../Utils/scrollIntoViewWithBlockNearest', () => jest.fn());
jest.mock('math-random', () => jest.fn(() => 0.123456789));
jest.mock('../RenderingActivities/useRenderingActivityKeys');

// Import mocked modules
import useRenderingActivityKeys from '../RenderingActivities/useRenderingActivityKeys';

// Setup mocks
const mockUseRenderingActivityKeys = useRenderingActivityKeys as jest.MockedFunction<typeof useRenderingActivityKeys>;

describe('TranscriptFocusComposer - focusRelativeActivity', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  afterEach(() => {
    // Cleanup
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
    }
    jest.clearAllMocks();
  });

  const createTestSetup = (config: {
    renderingActivityKeys: string[];
    groupKeyMappings: Record<string, string>;
    groupStates: Record<string, { isCollapsed: boolean }>;
  }) => {
    // Setup the mocks for this test
    mockUseRenderingActivityKeys.mockReturnValue([config.renderingActivityKeys]);

    const result = {
      containerRef: { current: container },
      context: {} as TranscriptFocusContextType,
      focusedKeys: []
    };

    const TestComponent = () => {
      const context = useContext(TranscriptFocusContext);
      const addLogicalGrouping = useAddLogicalGrouping();

      useMemo(() => {
        Object.assign(result.context, context);
        const focusedKey = (context.activeGroupDescendantIdState[0] || context.activeDescendantIdState[0])?.replace(
          /webchat__transcript-focus-[^__]+__/u,
          ''
        );
        result.focusedKeys.push(focusedKey);
      }, [context]);

      useMemo(() => {
        const groups = new Map();
        for (const [activityKey, groupKey] of Object.entries(config.groupKeyMappings)) {
          const group = groups.get(groupKey) ?? {
            key: groupKey,
            activityKeys: [],
            getGroupState: () => config.groupStates[groupKey]
          };

          group.activityKeys.push(activityKey);
          groups.set(groupKey, group);
        }

        for (const [, group] of groups.entries()) {
          addLogicalGrouping(group);
        }
      }, [addLogicalGrouping]);

      return null;
    };

    act(() => {
      render(
        <ActivityLogicalGroupingComposer>
          <TranscriptFocusComposer containerRef={result.containerRef}>
            <TestComponent />
          </TranscriptFocusComposer>
        </ActivityLogicalGroupingComposer>,
        container
      );
    });

    return result;
  };

  describe('Basic navigation', () => {
    test('should focus last activity by default', () => {
      const { context } = createTestSetup({
        renderingActivityKeys: ['activity1', 'activity2', 'activity3'],
        groupKeyMappings: {},
        groupStates: {}
      });

      const [focusedActivityKey] = context.focusedActivityKeyState;
      expect(focusedActivityKey).toBe('activity3');
    });

    test('should refocus previous activity', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'activity2', 'activity3'],
        groupKeyMappings: {},
        groupStates: {}
      });

      act(() => {
        context.focusRelativeActivity(-1); // a3 -> a2
      });
      act(() => {
        context.focusRelativeActivity(1); // a2 -> a3
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity3', // initial state (last activity)
        'activity-activity2', // backward
        'activity-activity3' // forward
      ]);
    });

    test('should handle navigation boundaries', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'activity2'],
        groupKeyMappings: {},
        groupStates: {}
      });

      // Try to navigate past boundaries
      act(() => {
        context.focusRelativeActivity(-1); // a2 -> a1
      });
      act(() => {
        context.focusRelativeActivity(-1); // a1 -> a1
      });
      act(() => {
        context.focusRelativeActivity(1); // a1 -> a2
      });
      act(() => {
        context.focusRelativeActivity(1); // a2 -> a2
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity2', // initial state
        'activity-activity1', // backward to first
        'activity-activity2' // forward to last (boundaries don't create new entries)
      ]);
    });

    test('should navigate linearly through activities', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'activity2', 'activity3'],
        groupKeyMappings: {},
        groupStates: {}
      });

      // Navigate backwards through all activities
      act(() => {
        context.focusRelativeActivity(-1); // a3 -> a2
      });
      act(() => {
        context.focusRelativeActivity(-1); // a2 -> a1
      });

      // Navigate forwards through all activities
      act(() => {
        context.focusRelativeActivity(1); // a1 -> a2
      });
      act(() => {
        context.focusRelativeActivity(1); // a2 -> a3
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity3', // initial state (last activity)
        'activity-activity2', // backward
        'activity-activity1', // backward
        'activity-activity2', // forward
        'activity-activity3' // forward
      ]);
    });

    test('should navigate activity with delta > 1 with overflow', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'activity2', 'activity3', 'activity4'],
        groupKeyMappings: {},
        groupStates: {}
      });

      act(() => {
        context.focusRelativeActivity(-2); // a4 -> a2
      });
      act(() => {
        context.focusRelativeActivity(-2); // a2 -> a1
      });
      act(() => {
        context.focusRelativeActivity(2); // a1 -> a3
      });
      act(() => {
        context.focusRelativeActivity(2); // a3 -> a4
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity4', // initial state (last activity)
        'activity-activity2', // backward by 2
        'activity-activity1', // backward by 1
        'activity-activity3', // forward by 2
        'activity-activity4' // forward by 1
      ]);
    });

    test('should navigate last/first activity', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'activity2', 'activity3'],
        groupKeyMappings: {},
        groupStates: {}
      });

      // Navigate last / first activity
      act(() => {
        context.focusRelativeActivity(-Infinity); // a3 -> a1
      });
      act(() => {
        context.focusRelativeActivity(Infinity); // a1 -> a3
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity3', // initial state (last activity)
        'activity-activity1', // backward
        'activity-activity3' // forward
      ]);
    });
  });

  describe('Group navigation resilience', () => {
    test('should skip collapsed group navigation', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'group1-activity1', 'group1-activity2', 'activity2'],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1'
        },
        groupStates: {
          group1: { isCollapsed: true }
        }
      });

      // Navigate backwards through collapsed group
      act(() => {
        context.focusRelativeActivity(-1); // a2 -> g1 (collapsed group header)
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1 -> a1
      });

      // Navigate forwards through collapsed group
      act(() => {
        context.focusRelativeActivity(1); // a1 -> g1 (collapsed group header)
      });
      act(() => {
        context.focusRelativeActivity(1); // g1 -> a2 (skip over collapsed group contents)
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity2', // initial state
        'group-group1', // backward: skip to collapsed group header
        'activity-activity1', // backward: to activity before group
        'group-group1', // forward: to collapsed group header
        'activity-activity2' // forward: skip over collapsed group contents
      ]);
    });

    test('should handle expanded group navigation', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'group1-activity1', 'group1-activity2', 'activity2'],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1'
        },
        groupStates: {
          group1: { isCollapsed: false }
        }
      });

      act(() => {
        context.focusRelativeActivity(-1); // a2 -> g1a2
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1a2 -> g1a1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1a1 -> g1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1 -> a1
      });

      act(() => {
        context.focusRelativeActivity(1); // a1 -> g1
      });
      act(() => {
        context.focusRelativeActivity(1); // g1 -> g1a1
      });
      act(() => {
        context.focusRelativeActivity(1); // g1a1 -> g1a2
      });
      act(() => {
        context.focusRelativeActivity(1); // g1a2 -> a2
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity2', // initial state
        'activity-group1-activity2', // backward: last activity in group
        'activity-group1-activity1', // backward: first activity in group
        'group-group1', // backward: group header
        'activity-activity1', // backward: activity before group
        'group-group1', // forward: group header when entering
        'activity-group1-activity1', // forward: first activity in group
        'activity-group1-activity2', // forward: last activity in group
        'activity-activity2' // forward: activity after group
      ]);
    });

    test('should refocus expanded group header when going in both directions', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'group1-activity1', 'group1-activity2', 'activity2'],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1'
        },
        groupStates: {
          group1: { isCollapsed: false }
        }
      });

      act(() => {
        context.focusRelativeActivity(-Infinity); // a2 -> a1
      });
      act(() => {
        context.focusRelativeActivity(1); // a1 -> g1
      });

      act(() => {
        context.focusRelativeActivity(1); // g1 -> g1a1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1a1 -> g1
      });

      act(() => {
        context.focusRelativeActivity(-1); // g1 -> a1
      });
      act(() => {
        context.focusRelativeActivity(1); // a1 -> g1
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity2', // initial state
        'activity-activity1', // backward to first activity
        'group-group1', // forward to group header
        'activity-group1-activity1', // forward to first activity in group
        'group-group1', // backward to group header
        'activity-activity1', // backward to activity before group
        'group-group1' // forward back to group header
      ]);
    });

    test('should refocus collapsed group header when going in both directions', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'group1-activity1', 'group1-activity2', 'activity2'],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1'
        },
        groupStates: {
          group1: { isCollapsed: true }
        }
      });

      act(() => {
        context.focusRelativeActivity(-1); // a2 -> g1
      });
      act(() => {
        context.focusRelativeActivity(1); // g1 -> a2
      });

      act(() => {
        context.focusRelativeActivity(-2); // a2 -> g1a1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1a1 -> g1
      });

      act(() => {
        context.focusRelativeActivity(-1); // g1 -> a1
      });
      act(() => {
        context.focusRelativeActivity(1); // a1 -> g1
      });
      act(() => {
        context.focusRelativeActivity(1); // g1 -> a2
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity2', // initial state
        'group-group1', // backward: to collapsed group header
        'activity-activity2', // forward: to initial activity
        'activity-group1-activity1', // backward (2): to first activity in group
        'group-group1', // backward: to collapsed group header
        'activity-activity1', // backward: to activity before group
        'group-group1', // forward: to collapsed group header
        'activity-activity2' // forward: to activity after group
      ]);
    });

    test('should handle navigation from activities in collapsed group', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: ['activity1', 'group1-activity1', 'group1-activity2', 'activity2'],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1'
        },
        groupStates: {
          group1: { isCollapsed: true }
        }
      });

      // Start from first activity
      act(() => {
        context.focusRelativeActivity(-Infinity); // a2 -> a1
      });

      // Navigate to group1-activity2 directly
      act(() => {
        context.focusRelativeActivity(2); // a1 -> g1a2
      });

      // Navigate down from activity in collapsed group - should exit the group
      act(() => {
        context.focusRelativeActivity(1); // g1a2 -> a2 (skip out of collapsed group)
      });

      // Navigate back to group1-activity1
      act(() => {
        context.focusRelativeActivity(-2); // a2 -> g1a1
      });

      // Navigate up from activity in collapsed group - should focus group header
      act(() => {
        context.focusRelativeActivity(-1); // g1a1 -> g1 (group header)
      });

      expect(focusedKeys).toStrictEqual([
        'activity-activity2', // initial state
        'activity-activity1', // navigate to first
        'activity-group1-activity2', // navigate to collapsed group activity
        'activity-activity2', // down from collapsed group should exit to next visible activity
        'activity-group1-activity1', // navigate to collapsed group activity
        'group-group1' // up from collapsed group activity should focus group header
      ]);
    });

    test('should handle direct navigation within collapsed groups', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: [
          'activity1',
          'group1-activity1',
          'group1-activity2',
          'group2-activity1',
          'group2-activity2',
          'activity2'
        ],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1',
          'group2-activity1': 'group2',
          'group2-activity2': 'group2'
        },
        groupStates: {
          group1: { isCollapsed: true },
          group2: { isCollapsed: false }
        }
      });

      act(() => {
        context.focusRelativeActivity(-3); // a2 -> g1a2
      });
      act(() => {
        context.focusRelativeActivity(1); // g1a2 -> g2
      });
      act(() => {
        context.focusRelativeActivity(2); // g2 -> g2a2
      });
      act(() => {
        context.focusRelativeActivity(1); // g2a2 -> a2
      });
      act(() => {
        context.focusRelativeActivity(-4); // g2 -> g1a1
      });
      act(() => {
        context.focusRelativeActivity(1); // g1a1 -> g2
      });
      act(() => {
        context.focusRelativeActivity(1); // g2 -> g2a1
      });
      act(() => {
        context.focusRelativeActivity(-2); // g2a1 -> g1a1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1a1 -> g1
      });

      // Should maintain valid state
      expect(focusedKeys).toStrictEqual([
        'activity-activity2',
        'activity-group1-activity2',
        'group-group2',
        'activity-group2-activity2',
        'activity-activity2',
        'activity-group1-activity1',
        'group-group2',
        'activity-group2-activity1',
        'activity-group1-activity1',
        'group-group1'
      ]);
    });

    test('should handle mixed group states', () => {
      const { context, focusedKeys } = createTestSetup({
        renderingActivityKeys: [
          'activity1',
          'group1-activity1',
          'group1-activity2',
          'group2-activity1',
          'group2-activity2',
          'activity2'
        ],
        groupKeyMappings: {
          'group1-activity1': 'group1',
          'group1-activity2': 'group1',
          'group2-activity1': 'group2',
          'group2-activity2': 'group2'
        },
        groupStates: {
          group1: { isCollapsed: true },
          group2: { isCollapsed: false }
        }
      });

      act(() => {
        context.focusRelativeActivity(-1); // a2 -> g2a2
      });
      act(() => {
        context.focusRelativeActivity(-1); // g2a2 -> g2a1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g2a1 -> g2
      });
      act(() => {
        context.focusRelativeActivity(-1); // g2 -> g1
      });
      act(() => {
        context.focusRelativeActivity(-1); // g1 -> a1
      });
      act(() => {
        context.focusRelativeActivity(1); // a1 -> g1
      });
      act(() => {
        context.focusRelativeActivity(1); // g1 -> g2
      });
      act(() => {
        context.focusRelativeActivity(1); // g2 -> g2a1
      });
      act(() => {
        context.focusRelativeActivity(1); // g2a1 -> g2a2
      });
      act(() => {
        context.focusRelativeActivity(1); // g2a2 -> a2
      });

      // Should maintain valid state
      expect(focusedKeys).toStrictEqual([
        'activity-activity2',
        'activity-group2-activity2',
        'activity-group2-activity1',
        'group-group2',
        'group-group1',
        'activity-activity1', // going back
        'group-group1',
        'group-group2',
        'activity-group2-activity1',
        'activity-group2-activity2',
        'activity-activity2'
      ]);
    });
  });
});
