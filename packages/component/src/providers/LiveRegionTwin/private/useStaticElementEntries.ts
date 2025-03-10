import useLiveRegionTwinContext from './useContext';

import type { StaticElementEntry } from './types';

export default function useStaticElementEntries(): readonly [readonly StaticElementEntry[]] {
  return useLiveRegionTwinContext().staticElementEntriesState;
}
