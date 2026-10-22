import { useLayoutEffect, useRef, type DependencyList, type ReactElement } from 'react';
import { useRefFrom } from 'use-ref-from';

import shallowEquals from '../../Utils/shallowEquals';
import useQueueStaticElement from './useQueueStaticElement';

/**
 * Pushes a node to the live region.
 *
 * Once the node is pushed, it cannot be undoed.
 *
 * @param createNode Create node to be pushed to the live region.
 * @param deps Will push a new node if the values in the list change.
 */
export default function useLiveRegion(
  createNode: () => false | null | ReactElement | string | undefined,
  deps: DependencyList
): void {
  const createNodeRef = useRefFrom(createNode);
  const queuedDepsRef = useRef<DependencyList>();
  const queueStaticElement = useQueueStaticElement();

  // Queue after render, not during render: updating <LiveRegionTwinComposer> while rendering another component is not allowed.
  // Layout effect, so the node is in the live region before the next paint, as when it was queued during render.
  useLayoutEffect(() => {
    // Strict Mode runs the effect twice on mount with the same deps, the node should only be queued once.
    if (queuedDepsRef.current && shallowEquals(queuedDepsRef.current, deps)) {
      return;
    }

    queuedDepsRef.current = deps;

    const node = createNodeRef?.current();

    node && queueStaticElement(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, createNodeRef, queueStaticElement]);
}
