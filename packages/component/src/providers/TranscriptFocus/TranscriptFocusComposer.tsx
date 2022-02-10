import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useCallback, useMemo } from 'react';

import type { FC, MutableRefObject } from 'react';

import scrollIntoViewWithBlockNearest from '../../Utils/scrollIntoViewWithBlockNearest';
import TranscriptFocusContext from './private/Context';
import useActivityTreeWithRenderer from '../ActivityTree/useActivityTreeWithRenderer';
import usePrevious from '../../hooks/internal/usePrevious';
import useStateRef from '../../hooks/internal/useStateRef';
import useValueRef from '../../hooks/internal/useValueRef';

import type { TranscriptFocusContextType } from './private/Context';

const { useGetKeyByActivity } = hooks;

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
  const [flattenedActivityTree] = useActivityTreeWithRenderer({ flat: true });
  const [_, setRawFocusedActivityKey, rawFocusedActivityKeyRef] = useStateRef<string | undefined>();
  const getKeyByActivity = useGetKeyByActivity();

  // As we need to use IDREF for `aria-activedescendant`,
  // this prefix will differentiate multiple instances of transcript on the same page.
  // eslint-disable-next-line no-magic-numbers
  const prefix = useMemo<string>(() => uniqueId(3), []);

  const getDescendantIdByActivityKey: (activityKey?: string) => string | undefined = useCallback(
    (activityKey?: string) => activityKey && `webchat__transcript-focus-${prefix}__activity-${activityKey}`,
    [prefix]
  );

  const renderingActivityKeys = useMemo<readonly string[]>(
    () => Object.freeze(flattenedActivityTree.map(({ activity }) => getKeyByActivity(activity))),
    [flattenedActivityTree, getKeyByActivity]
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
    () => (renderingActivityKeys.includes(rawFocusedActivityKey) ? rawFocusedActivityKey : last(renderingActivityKeys)),
    [renderingActivityKeys, rawFocusedActivityKey]
  );

  const focusedActivityKeyRef = useValueRef(focusedActivityKey);

  const activeDescendantId = useMemo<string>(
    () => getDescendantIdByActivityKey(focusedActivityKey),
    [getDescendantIdByActivityKey, focusedActivityKey]
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
      }

      if (withFocus) {
        containerRef.current?.focus();

        const activeDescendantId = getDescendantIdByActivityKey(
          activityKey === false
            ? // If "activityKey" is false, it means "focus nothing and reset it to the last activity".
              last(renderingActivityKeysRef.current)
            : activityKey && activityKey !== true
            ? // If "activity" is not "undefined" and not "true", it means "focus on this activity".
              activityKey
            : // If "activityKey" is "undefined", it means "don't modify the focus".
              // If "activityKey" is "true", it means "try to focus on anything".
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
      getDescendantIdByActivityKey,
      containerRef,
      focusedActivityKeyRef,
      renderingActivityKeysRef,
      rawFocusedActivityKeyRef,
      setRawFocusedActivityKey
    ]
  );

  const focusRelativeActivity = useCallback(
    (delta: number) => {
      const { current: orderedActivityKeys } = renderingActivityKeysRef;

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
    [focusedActivityKeyRef, renderingActivityKeysRef, focusByActivityKey]
  );

  const contextValue = useMemo<TranscriptFocusContextType>(
    () => ({
      activeDescendantIdState: Object.freeze([activeDescendantId]) as readonly [string],
      getDescendantIdByActivityKey,
      focusByActivityKey,
      focusedActivityKeyState: Object.freeze([focusedActivityKey]) as readonly [string],
      focusedExplicitlyState: Object.freeze([!!rawFocusedActivityKey]) as readonly [boolean],
      focusRelativeActivity
    }),
    [
      activeDescendantId,
      getDescendantIdByActivityKey,
      focusByActivityKey,
      focusedActivityKey,
      focusRelativeActivity,
      rawFocusedActivityKey
    ]
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
