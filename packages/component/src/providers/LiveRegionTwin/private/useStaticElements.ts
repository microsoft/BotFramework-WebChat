import useLiveRegionTwinContext from './useContext';

import type { LiveRegionElement } from './types';

export default function useStaticElements(): readonly [readonly LiveRegionElement[]] {
  return useLiveRegionTwinContext().staticElementsState;
}
