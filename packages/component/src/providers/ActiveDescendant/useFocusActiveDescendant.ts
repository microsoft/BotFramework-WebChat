import { useCallback } from 'react';

import scrollIntoViewWithBlockNearest from '../../Utils/scrollIntoViewWithBlockNearest';
import useActiveDescendantId from './useActiveDescendantId';
import useFocusContainer from './useFocusContainer';

export default function useFocusActiveDescendant() {
  const [_, setActiveDescendantId] = useActiveDescendantId();
  const focusContainer = useFocusContainer();

  return useCallback(
    nextActiveDescendantId => {
      setActiveDescendantId(nextActiveDescendantId);
      focusContainer();

      const activeDescendantElement = document.getElementById(nextActiveDescendantId);

      // Don't scroll active descendant into view if the focus is already inside it.
      // Otherwise, given the focus is on the send box, clicking on any <input> inside the Adaptive Cards may cause the view to move.
      // This UX is not desirable because click should not cause scroll.
      if (activeDescendantElement && !activeDescendantElement.contains(document.activeElement)) {
        scrollIntoViewWithBlockNearest(activeDescendantElement);
      }
    },
    [focusContainer, setActiveDescendantId]
  );
}
