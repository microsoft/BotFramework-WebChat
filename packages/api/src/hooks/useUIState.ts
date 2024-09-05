import { useMemo } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Gets the state of the UI.
 *
 * - `undefined` will enable and render all UI elements normally
 * - `"blueprint"` will hide rendering for most elements and render a blueprint UI instead, this could be used for loading state
 * - `"disabled"` will disable all interactive elements except temporal and non-submitting UI elements, such as "New messages" button
 */
export default function useUIState(): readonly ['blueprint' | 'disabled' | undefined] {
  const { uiState } = useWebChatAPIContext();

  return useMemo(() => Object.freeze([uiState]), [uiState]);
}
