import { RefObject, useCallback, useEffect, useState } from 'react';

import useObserveFocusVisible from './useObserveFocusVisible';

export default function useFocusVisible(targetRef: RefObject<HTMLElement>): [boolean] {
  const [focusVisible, setFocusVisible] = useState(false);

  const handleBlur = useCallback(() => setFocusVisible(false), [setFocusVisible]);
  const handleFocusVisible = useCallback(() => setFocusVisible(true), [setFocusVisible]);

  useObserveFocusVisible(targetRef, handleFocusVisible);

  useEffect(() => {
    const { current } = targetRef;

    current.addEventListener('blur', handleBlur);

    return () => current.removeEventListener('blur', handleBlur);
  }, [handleBlur, targetRef]);

  return [focusVisible];
}
