import { useEffect } from 'react';

// Because different browser handling disabled-but-focused UI different, we are implementing a more general solution.
// When the button is being disabled:
// - If it is not currently focused, we will set "disabled";
// - If it is currently focused, we will not set "disabled" until it is blurred (focus moved away).
function disableElement(element) {
  element.setAttribute('disabled', 'disabled');
}

export default function useDisableOnBlurEffect(targetRef, disabled) {
  useEffect(() => {
    if (disabled) {
      const { current } = targetRef;

      if (current) {
        if (document.activeElement !== current) {
          current.setAttribute('disabled', 'disabled');

          return () => current.removeAttribute('disabled');
        }

        const blurHandler = disableElement.bind(null, current);

        current.addEventListener('blur', blurHandler);

        return () => {
          current.removeAttribute('disabled');
          current.removeEventListener('blur', blurHandler);
        };
      }
    }
  }, [disabled, targetRef]);
}
