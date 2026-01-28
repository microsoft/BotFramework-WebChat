import React, { memo, useCallback, useMemo, type ReactNode } from 'react';
import { useReduceMemo } from 'use-reduce-memo';
import type { WebChatActivity } from 'botframework-webchat-core';
import { literal, object, safeParse } from 'valibot';

import useActivities from '../../hooks/useActivities';
import useWebChatAPIContext from '../../hooks/internal/useWebChatAPIContext';
import CapabilitiesContext from './private/Context';
import fetchCapabilitiesFromAdapter from './private/fetchCapabilitiesFromAdapter';
import type { Capabilities } from './types/Capabilities';

type Props = Readonly<{ children?: ReactNode | undefined }>;

const EMPTY_CAPABILITIES: Capabilities = Object.freeze({});

// Synthetic marker to trigger initial fetch - must be a stable reference
const INIT_MARKER = Object.freeze({ type: 'capabilities:init' as const });
type InitMarker = typeof INIT_MARKER;
type ReducerInput = WebChatActivity | InitMarker;

const CapabilitiesChangedEventSchema = object({
  type: literal('event'),
  name: literal('capabilitiesChanged')
});

const isInitMarker = (item: ReducerInput): item is InitMarker => item === INIT_MARKER;

const isCapabilitiesChangedEvent = (activity: ReducerInput): boolean =>
  safeParse(CapabilitiesChangedEventSchema, activity).success;

/**
 * Composer that derives capabilities from the adapter using a pure derivation pattern.
 *
 * Design principles:
 * 1. Initial fetch: Pulls capabilities from adapter on mount via synthetic init marker
 * 2. Event-driven updates: Re-fetches only when 'capabilitiesChanged' event is detected
 * 3. Stable references: Individual capability objects maintain reference equality if unchanged
 *    - This ensures consumers using selectors only re-render when their capability changes
 */
const CapabilitiesComposer = memo(({ children }: Props) => {
  const [activities] = useActivities();
  const { directLine } = useWebChatAPIContext();

  const activitiesWithInit = useMemo<readonly ReducerInput[]>(
    () => Object.freeze([INIT_MARKER, ...activities]),
    [activities]
  );

  // TODO: [P1] update to use EventTarget than activity$.
  const capabilities = useReduceMemo(
    activitiesWithInit,
    useCallback(
      (prevCapabilities: Capabilities, item: ReducerInput): Capabilities => {
        const shouldFetch = isInitMarker(item) || isCapabilitiesChangedEvent(item);

        if (!shouldFetch) {
          return prevCapabilities;
        }

        const { capabilities: newCapabilities, hasChanged } = fetchCapabilitiesFromAdapter(
          directLine,
          prevCapabilities
        );

        return hasChanged ? newCapabilities : prevCapabilities;
      },
      [directLine]
    ),
    EMPTY_CAPABILITIES
  );

  const contextValue = useMemo(() => Object.freeze({ capabilities }), [capabilities]);

  return <CapabilitiesContext.Provider value={contextValue}>{children}</CapabilitiesContext.Provider>;
});

CapabilitiesComposer.displayName = 'CapabilitiesComposer';

export default CapabilitiesComposer;
