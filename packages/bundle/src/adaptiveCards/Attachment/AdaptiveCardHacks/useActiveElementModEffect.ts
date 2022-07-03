import { useMemo, useRef } from 'react';

import findDOMNodeOwner from './private/findDOMNodeOwner';
import useAdaptiveCardModEffect from './useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import { AdaptiveCard, CardObject } from 'adaptivecards';

/**
 * When the Adaptive Card renderer refresh its content. The last focused element must be saved and then restored during render cycle.
 */
export default function useActiveElementModEffect(adaptiveCard: AdaptiveCard) {
  const activeCardObjectRef = useRef<CardObject | undefined>();
  const prevAdaptiveCard = usePrevious(adaptiveCard);

  if (prevAdaptiveCard !== adaptiveCard) {
    activeCardObjectRef.current = undefined;
  }

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard) => {
      // When apply, if we have saved the `CardObject` that was focused, restore its focused to the newly rendered element.
      activeCardObjectRef.current?.renderedElement?.focus?.();

      // When undo, we are preparing for the next rendering.
      // So, find and save the `CardObject` that is currently focused.
      return () => {
        activeCardObjectRef.current = findDOMNodeOwner(adaptiveCard, document.activeElement as HTMLElement);
      };
    },
    [activeCardObjectRef]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
