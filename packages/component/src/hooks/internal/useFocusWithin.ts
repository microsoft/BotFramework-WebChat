import { useCallback, useEffect, useState } from 'react';

import type { RefObject } from 'react';

export default function useFocusWithin(targetRef: RefObject<HTMLElement>): readonly [boolean] {
  const [focusWithin, setFocusWithin] = useState(false);

  const handleBlur = useCallback(() => setFocusWithin(false), [setFocusWithin]);
  const handleFocus = useCallback(
    ({ target }: FocusEvent) => {
      const targetElement = target as HTMLElement;

      setFocusWithin(targetRef.current === targetElement || !!targetRef.current?.contains(targetElement));
    },
    [setFocusWithin, targetRef]
  );

  useEffect(() => {
    document.addEventListener('blur', handleBlur);
    document.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('blur', handleBlur);
      document.removeEventListener('focus', handleFocus);
    };
  }, [handleBlur, handleFocus]);

  return Object.freeze([focusWithin]) as readonly [boolean];
}
