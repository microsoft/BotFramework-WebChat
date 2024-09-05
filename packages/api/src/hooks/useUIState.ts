import { useMemo } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Gets the state of the UI.
 *
 * - `undefined` will enable and render all UI elements normally
 * - `"disabled"` will disable all interactive elements except temporal and non-submitting UI elements, such as "New messages" button
 * - `"mock"` will hide rendering for most elements and render a mock UI instead, this could be used for loading state
 */
export default function useUIState(): readonly ['disabled' | 'mock' | undefined] {
  const { uiState } = useWebChatAPIContext();

  return useMemo(() => Object.freeze([uiState]), [uiState]);
}
