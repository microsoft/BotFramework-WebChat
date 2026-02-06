import React, { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import useWebChatAPIContext from '../../hooks/internal/useWebChatAPIContext';
import CapabilitiesContext from './private/Context';
import fetchCapabilitiesFromAdapter from './private/fetchCapabilitiesFromAdapter';
import type { Capabilities } from './types/Capabilities';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const EMPTY_CAPABILITIES: Capabilities = Object.freeze({});

/**
 * Composer that provides capabilities from the adapter via EventTarget pattern.
 *
 * Design principles:
 * 1. Initial fetch: Pulls capabilities from adapter on mount
 * 2. Event-driven updates: Re-fetches when adapter dispatches 'capabilitieschanged' event
 * 3. Stable references: Individual capability objects maintain reference equality if unchanged
 *    - This ensures consumers using selectors only re-render when their capability changes
 */
const CapabilitiesComposer = memo(({ children }: Props) => {
  const { directLine } = useWebChatAPIContext();

  const getAllCapabilities = useCallback(
    () => fetchCapabilitiesFromAdapter(directLine, EMPTY_CAPABILITIES).capabilities,
    [directLine]
  );

  const [capabilities, setCapabilities] = useState<Capabilities>(() => getAllCapabilities());

  useEffect(() => {
    const handleCapabilitiesChange = () => {
      setCapabilities(prevCapabilities => {
        const { capabilities, hasChanged } = fetchCapabilitiesFromAdapter(directLine, prevCapabilities);
        return hasChanged ? capabilities : prevCapabilities;
      });
    };

    if (typeof directLine?.addEventListener === 'function') {
      directLine.addEventListener('capabilitieschanged', handleCapabilitiesChange);

      return () => directLine.removeEventListener('capabilitieschanged', handleCapabilitiesChange);
    }
  }, [directLine]);

  const contextValue = useMemo(() => Object.freeze({ capabilities }), [capabilities]);

  return <CapabilitiesContext.Provider value={contextValue}>{children}</CapabilitiesContext.Provider>;
});

CapabilitiesComposer.displayName = 'CapabilitiesComposer';

export default CapabilitiesComposer;
