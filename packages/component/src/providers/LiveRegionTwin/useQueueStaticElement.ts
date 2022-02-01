import useLiveRegionContext from './private/useContext';

import type { LiveRegionElement } from './private/types';

/**
 * Queues a static element to the live region.
 *
 * After the element is queued, screen reader will eventually narrate it and it cannot be changed.
 */
export default function useQueueStaticElement(): (element: LiveRegionElement) => void {
  return useLiveRegionContext().queueStaticElement;
}
