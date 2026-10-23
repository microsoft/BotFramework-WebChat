import { useMemo } from 'react';

import getGroupDescendantId from './private/getGroupDescendantId';
import useTranscriptFocusContext from './private/useContext';

/** Returns the ID of the group for `aria-activedescendant`, or `undefined` without a group key. */
export default function useGroupDescendantIdByGroupKey(groupKey?: string | undefined): readonly [string | undefined] {
  const { prefix } = useTranscriptFocusContext();

  // Derived from values only: a change of `prefix` or `groupKey` re-renders the caller.
  return useMemo(() => Object.freeze([getGroupDescendantId(prefix, groupKey)] as const), [groupKey, prefix]);
}
