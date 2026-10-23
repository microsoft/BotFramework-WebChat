import { useMemo } from 'react';

import getDescendantId from './private/getDescendantId';
import useTranscriptFocusContext from './private/useContext';

/** Returns the ID of the group for `aria-activedescendant`, or `undefined` without a group key. */
export default function useGroupDescendantIdByGroupKey(groupKey?: string | undefined): readonly [string | undefined] {
  const { prefix } = useTranscriptFocusContext();

  // Derived from values only: a change of `prefix` or `groupKey` re-renders the caller.
  return useMemo(() => Object.freeze([getDescendantId(prefix, 'group', groupKey)] as const), [groupKey, prefix]);
}
