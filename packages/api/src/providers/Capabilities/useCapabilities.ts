import { useMemo, useRef } from 'react';
import useCapabilitiesContext from './private/useContext';
import type { Capabilities } from './types/Capabilities';

/**
 * Hook to access adapter capabilities with a selector function.
 * Only triggers re-render when the selected value changes (shallow comparison).
 *
 * @example
 * // Get voice configuration only
 * const voiceConfig = useCapabilities(caps => caps.voiceConfiguration);
 */
export default function useCapabilities<T>(selector: (capabilities: Capabilities) => T): T {
  const { capabilities } = useCapabilitiesContext();
  const selectedValue = selector(capabilities);
  const prevSelectedValueRef = useRef<T>(selectedValue);

  return useMemo(() => {
    if (Object.is(prevSelectedValueRef.current, selectedValue)) {
      return prevSelectedValueRef.current;
    }
    prevSelectedValueRef.current = selectedValue;
    return selectedValue;
  }, [selectedValue]);
}
