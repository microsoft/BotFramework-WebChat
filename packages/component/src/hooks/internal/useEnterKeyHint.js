import { useEffect } from 'react';

export default function useEnterKeyHint(elementRef, enterKeyHint) {
  // The version of React we are using does not support the capitalized version of "enterKeyHint" yet.
  // To prevent warnings from React, we need to set it manually using attributes.
  useEffect(() => {
    const { current } = elementRef;

    if (current) {
      current.enterKeyHint = enterKeyHint;
    }
  }, [enterKeyHint, elementRef]);
}
