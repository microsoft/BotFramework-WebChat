import { useEffect, type DependencyList, type ReactElement } from 'react';
import { useRefFrom } from 'use-ref-from';

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
) {
  const createNodeRef = useRefFrom(createNode);
  const queueStaticElement = useQueueStaticElement();

  // Unless "deps" change on every render, this should not cause dead loop.
  // TODO: [P1] Can we build a `useEffectWithDeadLoopDetection()`?
  useEffect(() => {
    const node = createNodeRef?.current();

    // "queueStaticElement()" will "setState", check for dead loop.
    node && queueStaticElement(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, createNodeRef, queueStaticElement]);
}
