import { useEffect } from 'react';

import ScrollPosition from '../types/ScrollPosition';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useObserveScrollPosition(
  observer: (scrollPosition: ScrollPosition) => void,
  deps: any[]
): void {
  if (typeof observer !== 'function') {
    observer = undefined;
    console.warn('botframework-webchat: First argument passed to "useObserveScrollPosition" must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to "useObserveScrollPosition" must be an array if specified.'
    );
  }

  const { observeScrollPosition } = useWebChatUIContext();

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => observer && observeScrollPosition(observer), [...(deps || []), observer, observeScrollPosition]);
}
