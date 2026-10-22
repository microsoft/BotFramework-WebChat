import { useMemo } from 'react';

import useTranscriptFocusContext from './private/useContext';

/**
 * Returns the ID of the group's active descendant element, for `aria-activedescendant`.
 *
 * The ID is derived from the group key and the transcript instance, so the component re-renders when either changes.
 */
export default function useGroupDescendantIdByGroupKey(groupKey?: string | undefined): readonly [string | undefined] {
  const { getGroupDescendantIdByGroupKey } = useTranscriptFocusContext();

  return useMemo(
    () => Object.freeze([getGroupDescendantIdByGroupKey(groupKey)] as const),
    [getGroupDescendantIdByGroupKey, groupKey]
  );
}
