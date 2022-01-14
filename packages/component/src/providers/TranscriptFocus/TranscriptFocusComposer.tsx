import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useCallback, useMemo } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';
import type { FC, MutableRefObject } from 'react';

import scrollIntoViewWithBlockNearest from '../../Utils/scrollIntoViewWithBlockNearest';
import TranscriptFocusContext from './private/Context';
import useActivityTreeWithRenderer from '../ActivityTree/useActivityTreeWithRenderer';
import useGetKeyByActivity from '../ActivityKeyer/useGetKeyByActivity';
import usePrevious from '../../hooks/internal/usePrevious';
import useStateRef from '../../hooks/internal/useStateRef';
import useValueRef from '../../hooks/internal/useValueRef';

import type { TranscriptFocusContextType } from './private/Context';

type TranscriptFocusComposerProps = {
  containerRef: MutableRefObject<HTMLElement>;
};

function last<T>(array: ArrayLike<T>) {
  return array[array.length - 1];
}

function uniqueId(count = Infinity) {
  return (
    random()
      // eslint-disable-next-line no-magic-numbers
      .toString(36)
      // eslint-disable-next-line no-magic-numbers
      .substring(2, 2 + count)
  );
}

const TranscriptFocusComposer: FC<TranscriptFocusComposerProps> = ({ children, containerRef }) => {
  const [activityTree] = useActivityTreeWithRenderer();
  const [_, setRawFocusedActivityKey, rawFocusedActivityKeyRef] = useStateRef<string | undefined>();
  const getKeyByActivity = useGetKeyByActivity();

  // As we need to use IDREF for `aria-activedescendant`,
  // this prefix will differentiate multiple instances of transcript on the same page.
  // eslint-disable-next-line no-magic-numbers
  const prefix = useMemo<string>(() => uniqueId(3), []);

  const computeElementIdFromActivityKey: (activityKey?: string) => string | undefined = useCallback(
    (activityKey?: string) => activityKey && `webchat__transcript-focus-${prefix}__activity-${activityKey}`,
    [prefix]
  );

  const orderedActivities = useMemo<readonly DirectLineActivity[]>(() => {
    const intermediate = [];

    activityTree.forEach(entriesWithSameSender => {
      entriesWithSameSender.forEach(entriesWithSameSenderAndStatus => {
        entriesWithSameSenderAndStatus.forEach(({ activity }) => {
          intermediate.push(activity);
        });
      });
    });

    return Object.freeze(intermediate);
  }, [activityTree]);

  const orderedActivityKeys = useMemo<readonly string[]>(
    () => Object.freeze(orderedActivities.map(getKeyByActivity)),
    [getKeyByActivity, orderedActivities]
  );

  const orderedActivityKeysRef = useValueRef<readonly string[]>(orderedActivityKeys);

  // While the transcript or any descendants are not focused, if the transcript is updated, reset the user-selected active descendant.
  // This will assume the last activity, if any, will be the active descendant.
  const prevActivityTree = usePrevious(activityTree);

  if (activityTree !== prevActivityTree && !containerRef.current?.contains(document.activeElement)) {
    rawFocusedActivityKeyRef.current = undefined;
  }

  const { current: rawFocusedActivityKey } = rawFocusedActivityKeyRef;

  const focusedActivityKey = useMemo<string>(
    () => (orderedActivityKeys.includes(rawFocusedActivityKey) ? rawFocusedActivityKey : last(orderedActivityKeys)),
    [orderedActivityKeys, rawFocusedActivityKey]
  );

  const focusedActivityKeyRef = useValueRef(focusedActivityKey);

  const activeDescendantId = useMemo<string>(
    () => computeElementIdFromActivityKey(focusedActivityKey),
    [computeElementIdFromActivityKey, focusedActivityKey]
  );

  const focusByActivityKey = useCallback<
    (activityKey: false | string | undefined, withFocus: boolean | undefined) => void
  >(
    (activityKey: false | string | undefined, withFocus: boolean | undefined = true) => {
      if (activityKey === false) {
        setRawFocusedActivityKey(undefined);
      } else if (activityKey) {
        setRawFocusedActivityKey(activityKey);
      }

      if (withFocus) {
        containerRef.current?.focus();

        const activeDescendantId = computeElementIdFromActivityKey(
          activityKey === false
            ? // If "activityKey" is false, it means "focus nothing and reset it to the last activity".
              last(orderedActivityKeysRef.current)
            : activityKey
            ? activityKey
            : // If "activityKey" is "undefined", it means "don't modify the focus".
              rawFocusedActivityKeyRef.current
        );

        const activeDescendantElement = activeDescendantId && document.getElementById(activeDescendantId);

        // Don't scroll active descendant into view if the focus is already inside it.
        // Otherwise, given the focus is on the send box, clicking on any <input> inside the Adaptive Cards may cause the view to move.
        // This UX is not desirable because click should not cause scroll.
        if (activeDescendantElement && !activeDescendantElement.contains(document.activeElement)) {
          scrollIntoViewWithBlockNearest(activeDescendantElement);
        }
      }
    },
    [
      computeElementIdFromActivityKey,
      containerRef,
      orderedActivityKeysRef,
      rawFocusedActivityKeyRef,
      setRawFocusedActivityKey
    ]
  );

  const focusRelativeActivity = useCallback(
    (delta: number) => {
      const { current: orderedActivityKeys } = orderedActivityKeysRef;

      if (isNaN(delta) || !orderedActivityKeys.length) {
        return focusByActivityKey(false, true);
      }

      const { current: focusedActivityKey } = focusedActivityKeyRef;

      const index = orderedActivityKeys.indexOf(focusedActivityKey);
      const nextIndex = ~index
        ? Math.max(0, Math.min(orderedActivityKeys.length - 1, index + delta))
        : orderedActivityKeys.length - 1;

      focusByActivityKey(orderedActivityKeys[+nextIndex], true);
    },
    [focusedActivityKeyRef, orderedActivityKeysRef, focusByActivityKey]
  );

  const contextValue = useMemo<TranscriptFocusContextType>(
    () => ({
      activeDescendantIdState: Object.freeze([activeDescendantId]) as readonly [string],
      computeElementIdFromActivityKey,
      focusByActivityKey,
      focusedActivityKeyState: Object.freeze([focusedActivityKey]) as readonly [string],
      focusRelativeActivity
    }),
    [activeDescendantId, computeElementIdFromActivityKey, focusByActivityKey, focusedActivityKey, focusRelativeActivity]
  );

  return <TranscriptFocusContext.Provider value={contextValue}>{children}</TranscriptFocusContext.Provider>;
};

TranscriptFocusComposer.propTypes = {
  // PropTypes is not fully compatible with TypeScript.
  // @ts-ignore
  containerRef: PropTypes.shape({
    current: PropTypes.instanceOf(HTMLElement)
  }).isRequired
};

export default TranscriptFocusComposer;
