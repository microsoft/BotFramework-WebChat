/* eslint-disable no-magic-numbers */
import random from 'math-random';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, type MutableRefObject, type ReactNode } from 'react';

import { useGetLogicalGroupKey, useGetGroupState } from '../ActivityLogicalGrouping';
import useGetLogicalGroupBoundaries from '../ActivityLogicalGrouping/useGetLogicalGroupBoundaries';
import usePrevious from '../../hooks/internal/usePrevious';
import useStateRef from '../../hooks/internal/useStateRef';
import useValueRef from '../../hooks/internal/useValueRef';
import scrollIntoViewWithBlockNearest from '../../Utils/scrollIntoViewWithBlockNearest';
import useRenderingActivityKeys from '../RenderingActivities/useRenderingActivityKeys';
import TranscriptFocusContext, { type TranscriptFocusContextType } from './private/Context';

type TranscriptFocusComposerProps = Readonly<{
  children?: ReactNode | undefined;
  containerRef: MutableRefObject<HTMLElement>;
}>;

function uniqueId(count = Infinity) {
  return random()
    .toString(36)
    .substring(2, 2 + count);
}

const TranscriptFocusComposer = ({ children, containerRef }: TranscriptFocusComposerProps) => {
  const getGroupKeyByActivityKey = useGetLogicalGroupKey();
  const getGroupBoundaries = useGetLogicalGroupBoundaries();
  const getGroupState = useGetGroupState();
  const [renderingActivityKeys] = useRenderingActivityKeys();
  const [rawFocusedActivityGroupKey, setRawFocusedActivityGroupKey, rawFocusedActivityGroupKeyRef] = useStateRef<
    string | undefined
  >();
  const [, setRawFocusedActivityKey, rawFocusedActivityKeyRef] = useStateRef<string | undefined>();

  // As we need to use IDREF for `aria-activedescendant`,
  // this prefix will differentiate multiple instances of transcript on the same page.
  const prefix = useMemo<string>(() => uniqueId(3), []);

  const getDescendantIdByActivityKey: (activityKey?: string) => string | undefined = useCallback(
    (activityKey?: string) => activityKey && `webchat__transcript-focus-${prefix}__activity-${activityKey}`,
    [prefix]
  );

  const getGroupDescendantIdByGroupKey: (groupKey?: string) => string | undefined = useCallback(
    (groupKey?: string) => groupKey && `webchat__transcript-focus-${prefix}__group-${groupKey}`,
    [prefix]
  );

  const getGroupDescendantIdByActivityKey: (activityKey?: string) => string | undefined = useCallback(
    (activityKey?: string) => activityKey && getGroupDescendantIdByGroupKey(getGroupKeyByActivityKey(activityKey)),
    [getGroupKeyByActivityKey, getGroupDescendantIdByGroupKey]
  );

  const renderingActivityKeysRef = useValueRef<readonly string[]>(renderingActivityKeys);

  // While the transcript or any descendants are not focused, if the transcript is updated, reset the user-selected active descendant.
  // This will assume the last activity, if any, will be the active descendant.
  const prevRenderingActivityKeys = usePrevious(renderingActivityKeys);

  if (renderingActivityKeys !== prevRenderingActivityKeys && !containerRef.current?.contains(document.activeElement)) {
    rawFocusedActivityKeyRef.current = undefined;
  }

  const { current: rawFocusedActivityKey } = rawFocusedActivityKeyRef;

  const focusedActivityKey = useMemo<string>(
    () =>
      renderingActivityKeys.includes(rawFocusedActivityKey) ? rawFocusedActivityKey : renderingActivityKeys.at(-1),
    [renderingActivityKeys, rawFocusedActivityKey]
  );

  const focusedActivityKeyRef = useValueRef(focusedActivityKey);

  const activeDescendantId = useMemo<string>(
    () => getDescendantIdByActivityKey(focusedActivityKey),
    [getDescendantIdByActivityKey, focusedActivityKey]
  );

  const activeGroupDescendantId = useMemo<string>(
    () => getGroupDescendantIdByGroupKey(rawFocusedActivityGroupKey),
    [getGroupDescendantIdByGroupKey, rawFocusedActivityGroupKey]
  );

  const handleFocus = useCallback(
    (activeDescendantId: string) => {
      containerRef.current?.focus();

      const activeDescendantElement = activeDescendantId && document.getElementById(activeDescendantId);

      // Don't scroll active descendant into view if the focus is already inside it.
      // Otherwise, given the focus is on the send box, clicking on any <input> inside the Adaptive Cards may cause the view to move.
      // This UX is not desirable because click should not cause scroll.
      if (activeDescendantElement && !activeDescendantElement.contains(document.activeElement)) {
        scrollIntoViewWithBlockNearest(activeDescendantElement);
      }
    },
    [containerRef]
  );

  const focusByGroupKey = useCallback(
    (groupKey: string | undefined, withFocus = true) => {
      if (!groupKey) {
        setRawFocusedActivityGroupKey(undefined);
        return;
      }
      setRawFocusedActivityGroupKey(groupKey);

      const groupDescendantId = getGroupDescendantIdByGroupKey(groupKey);

      withFocus && groupDescendantId && handleFocus(groupDescendantId);
    },
    [getGroupDescendantIdByGroupKey, handleFocus, setRawFocusedActivityGroupKey]
  );

  const focusByActivityKey = useCallback<
    (activityKey: boolean | string | undefined, withFocus: boolean | undefined) => void
  >(
    (activityKey: boolean | string | undefined, withFocus: boolean | undefined = true) => {
      if (activityKey === false) {
        // `false` means set it to nothing.
        setRawFocusedActivityKey(undefined);
      } else if (activityKey === true) {
        // `true` means set to something if it is not set.
        setRawFocusedActivityKey(key => key || focusedActivityKeyRef.current);
      } else if (activityKey) {
        setRawFocusedActivityKey(activityKey);
        focusByGroupKey(undefined, false);
      }

      const groupKey = typeof activityKey === 'string' && getGroupKeyByActivityKey(activityKey);
      const groupState = groupKey && getGroupState(groupKey);

      // shortcut for collapsed group
      // when collapsed, we do not want to focus on the group or scroll it into view
      if (groupState?.isCollapsed) {
        return;
      }

      const activeDescendantId = getDescendantIdByActivityKey(
        activityKey === false
          ? // If "activityKey" is false, it means "focus nothing and reset it to the last activity".
            renderingActivityKeysRef.current.at(-1)
          : activityKey && activityKey !== true
            ? // If "activity" is not "undefined" and not "true", it means "focus on this activity".
              activityKey
            : // If "activityKey" is "undefined", it means "don't modify the focus".
              // If "activityKey" is "true", it means "try to focus on anything".
              rawFocusedActivityKeyRef.current
      );

      withFocus && activeDescendantId && handleFocus(activeDescendantId);
    },
    [
      focusByGroupKey,
      getGroupKeyByActivityKey,
      getGroupState,
      getDescendantIdByActivityKey,
      renderingActivityKeysRef,
      rawFocusedActivityKeyRef,
      handleFocus,
      setRawFocusedActivityKey,
      focusedActivityKeyRef
    ]
  );

  // Helper function to get the next activity linearly
  const getNextActivityLinear = useCallback(
    (currentActivityKey: string, direction: 'up' | 'down'): string | undefined => {
      const { current: orderedActivityKeys } = renderingActivityKeysRef;
      const currentIndex = orderedActivityKeys.indexOf(currentActivityKey);

      if (currentIndex === -1) {
        return undefined;
      }

      const delta = direction === 'up' ? -1 : 1;
      const nextIndex = currentIndex + delta;

      if (nextIndex >= 0 && nextIndex < orderedActivityKeys.length) {
        return orderedActivityKeys[+nextIndex];
      }

      return undefined;
    },
    [renderingActivityKeysRef]
  );

  // Handle navigation from a focused group header
  const handleHeaderTransition = useCallback(
    (direction: 'up' | 'down') => {
      const { current: currentGroupKey } = rawFocusedActivityGroupKeyRef;
      const { current: orderedActivityKeys } = renderingActivityKeysRef;
      const currentGroupState = getGroupState(currentGroupKey);
      const [firstActivityKey, lastActivityKey] = getGroupBoundaries(currentGroupKey);

      if (direction === 'down') {
        if (!currentGroupState?.isCollapsed) {
          // From expanded group header, go to first activity in the group
          if (firstActivityKey) {
            focusByActivityKey(firstActivityKey, true);
          }
        } else {
          // From collapsed group header, skip to next activity/group outside this group
          const lastGroupActivityIndex = orderedActivityKeys.indexOf(lastActivityKey);

          if (lastGroupActivityIndex !== -1 && lastGroupActivityIndex + 1 < orderedActivityKeys.length) {
            const nextActivityKey = orderedActivityKeys[lastGroupActivityIndex + 1];
            const nextGroupKey = getGroupKeyByActivityKey(nextActivityKey);

            if (nextGroupKey) {
              // Next activity is in a group, focus the group header first
              focusByGroupKey(nextGroupKey);
            } else {
              // Next activity is not in a group, focus it normally
              focusByActivityKey(nextActivityKey, true);
            }
          }
        }
      } else if (direction === 'up') {
        // From group header, go to previous activity/group
        const currentIndex = orderedActivityKeys.indexOf(firstActivityKey);
        if (currentIndex !== -1) {
          const prevActivityKey = orderedActivityKeys[currentIndex - 1];
          const prevGroupKey = getGroupKeyByActivityKey(prevActivityKey);
          const prevGroupState =
            prevGroupKey && prevGroupKey !== currentGroupKey ? getGroupState(prevGroupKey) : undefined;

          // Previous activity is in a different collapsed group
          if (prevGroupState?.isCollapsed) {
            focusByActivityKey(prevActivityKey, false);
            focusByGroupKey(prevGroupKey);
          } else {
            focusByActivityKey(prevActivityKey, true);
          }
        }
      }
    },
    [
      rawFocusedActivityGroupKeyRef,
      renderingActivityKeysRef,
      getGroupState,
      getGroupBoundaries,
      focusByActivityKey,
      focusByGroupKey,
      getGroupKeyByActivityKey
    ]
  );

  // Helper function to handle navigation to a different group
  const handleGroupTransition = useCallback(
    (currentActivityKey: string, nextActivityKey: string, direction: 'up' | 'down') => {
      const currentGroupKey = getGroupKeyByActivityKey(currentActivityKey);
      const nextGroupKey = getGroupKeyByActivityKey(nextActivityKey);

      if (!nextGroupKey || nextGroupKey === currentGroupKey) {
        // Not changing groups - focus activity, reset group
        focusByActivityKey(nextActivityKey, true);
        return;
      }

      // Moving to a different group
      const [firstActivityKey, lastActivityKey] = getGroupBoundaries(nextGroupKey);
      const nextGroupState = getGroupState(nextGroupKey);

      if (direction === 'down' && firstActivityKey === nextActivityKey) {
        // Going down into a new group - always focus header first
        focusByActivityKey(currentActivityKey, false);
        focusByGroupKey(nextGroupKey);
      } else if (direction === 'up' && lastActivityKey === nextActivityKey && nextGroupState?.isCollapsed) {
        // Going up into a collapsed group from below - focus header
        focusByGroupKey(nextGroupKey);
      } else {
        // Other cases - focus activity, reset header focus
        focusByActivityKey(nextActivityKey, true);
      }
    },
    [getGroupKeyByActivityKey, getGroupBoundaries, getGroupState, focusByActivityKey, focusByGroupKey]
  );

  // Helper function to handle delta > 1 navigation
  const handleDeltaNavigation = useCallback(
    (delta: number) => {
      const { current: orderedActivityKeys } = renderingActivityKeysRef;
      const { current: focusedActivityKey } = focusedActivityKeyRef;

      // Handle jumping to first/last activity
      if (Math.abs(delta) === Infinity || Math.abs(delta) >= orderedActivityKeys.length) {
        const targetActivityKey = delta < 0 ? orderedActivityKeys.at(0) : orderedActivityKeys.at(-1);
        if (targetActivityKey) {
          focusByActivityKey(targetActivityKey, true);
        }
      }

      // For delta > 1, handle multi-step navigation
      if (Math.abs(delta) > 1) {
        const currentIndex = orderedActivityKeys.indexOf(focusedActivityKey || '');
        if (currentIndex !== -1) {
          const targetIndex = Math.max(0, Math.min(orderedActivityKeys.length - 1, currentIndex + delta));
          const targetActivityKey = orderedActivityKeys.at(targetIndex);
          if (targetActivityKey) {
            focusByActivityKey(targetActivityKey, true);
          }
        }
      }
    },
    [focusByActivityKey, focusedActivityKeyRef, renderingActivityKeysRef]
  );

  const focusRelativeActivity = useCallback(
    (delta: number) => {
      const { current: orderedActivityKeys } = renderingActivityKeysRef;
      const { current: rawFocusedActivityGroupKey } = rawFocusedActivityGroupKeyRef;

      if (isNaN(delta) || !orderedActivityKeys.length) {
        return focusByActivityKey(false, true);
      }

      const { current: focusedActivityKey } = focusedActivityKeyRef;

      const isHeaderFocused = !!activeGroupDescendantId;

      if (delta === 0) {
        if (isHeaderFocused) {
          focusByGroupKey(rawFocusedActivityGroupKey, true);
        } else {
          focusByActivityKey(focusedActivityKey, true);
        }
        return;
      }

      if (Math.abs(delta) > 1) {
        return handleDeltaNavigation(delta);
      }

      const direction = delta < 0 ? 'up' : 'down';

      // Handle navigation from a focused group header
      if (isHeaderFocused && rawFocusedActivityGroupKey) {
        return handleHeaderTransition(direction);
      }

      // Handle navigation from a focused activity
      const groupKey = getGroupKeyByActivityKey(focusedActivityKey);
      const [firstActivityKey, lastActivityKey] = getGroupBoundaries(groupKey);
      const groupState = groupKey ? getGroupState(groupKey) : undefined;

      // In group special cases
      if (groupKey) {
        if (direction === 'up') {
          // For expanded groups: only focus header when going up from first activity
          // For collapsed groups: focus header when going up from any activity in the group
          if ((firstActivityKey === focusedActivityKey && !groupState?.isCollapsed) || groupState?.isCollapsed) {
            // From first activity in expanded group OR any activity in collapsed group, go to group header
            focusByActivityKey(focusedActivityKey, false);
            focusByGroupKey(groupKey);
            return;
          }
        } else if (direction === 'down') {
          // Special handling for collapsed groups: when moving down from any activity in a collapsed group,
          // jump to the next visible element outside the group
          if (groupState?.isCollapsed) {
            const nextActivityKey = getNextActivityLinear(lastActivityKey, direction);
            return handleGroupTransition(lastActivityKey, nextActivityKey, direction);
          }
        }
      }

      // Handle regular linear navigation
      const nextActivityKey = getNextActivityLinear(focusedActivityKey, direction);
      if (nextActivityKey) {
        return handleGroupTransition(focusedActivityKey, nextActivityKey, direction);
      }
    },
    [
      renderingActivityKeysRef,
      rawFocusedActivityGroupKeyRef,
      focusedActivityKeyRef,
      handleDeltaNavigation,
      activeGroupDescendantId,
      getGroupKeyByActivityKey,
      getGroupBoundaries,
      getGroupState,
      getNextActivityLinear,
      focusByActivityKey,
      handleHeaderTransition,
      focusByGroupKey,
      handleGroupTransition
    ]
  );

  const contextValue = useMemo<TranscriptFocusContextType>(
    () => ({
      activeDescendantIdState: Object.freeze([activeDescendantId]) as readonly [string],
      activeGroupDescendantIdState: Object.freeze([activeGroupDescendantId]) as readonly [string],
      getDescendantIdByActivityKey,
      getGroupDescendantIdByActivityKey,
      focusByActivityKey,
      focusByGroupKey,
      focusedActivityKeyState: Object.freeze([focusedActivityKey]) as readonly [string],
      focusedGroupKeyState: Object.freeze([rawFocusedActivityGroupKey]) as readonly [string],
      focusedExplicitlyState: Object.freeze([!!rawFocusedActivityKey]) as readonly [boolean],
      focusRelativeActivity
    }),
    [
      activeDescendantId,
      activeGroupDescendantId,
      getDescendantIdByActivityKey,
      getGroupDescendantIdByActivityKey,
      focusByActivityKey,
      focusByGroupKey,
      focusedActivityKey,
      rawFocusedActivityGroupKey,
      rawFocusedActivityKey,
      focusRelativeActivity
    ]
  );

  return <TranscriptFocusContext.Provider value={contextValue}>{children}</TranscriptFocusContext.Provider>;
};

TranscriptFocusComposer.displayName = 'TranscriptFocusComposer';

TranscriptFocusComposer.propTypes = {
  // PropTypes is not fully compatible with TypeScript.
  // @ts-ignore
  containerRef: PropTypes.shape({
    current: PropTypes.instanceOf(HTMLElement)
  }).isRequired
};

export default memo(TranscriptFocusComposer);
