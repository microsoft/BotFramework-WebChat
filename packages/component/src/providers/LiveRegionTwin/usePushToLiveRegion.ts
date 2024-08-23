import { useMemo, type DependencyList } from 'react';
import { useRefFrom } from 'use-ref-from';

import useQueueStaticElement from './useQueueStaticElement';
import { StaticElement } from './private/types';

export default function usePushToLiveRegion(
  fn: () => StaticElement | undefined | null | '' | false,
  deps: DependencyList = []
) {
  const fnRef = useRefFrom(fn);
  const queueStaticElement = useQueueStaticElement();

  useMemo(() => {
    const nodes = fnRef?.current();

    nodes && queueStaticElement(nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, fnRef, queueStaticElement]);
}
