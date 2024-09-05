import { useMemo } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Gets the state of the UI.
 *
 * - `undefined` will render normally
 * - `"blueprint"` will render as few UI elements as possible and should be non-functional
 *   - Useful for loading scenarios
 * - `"disabled"` will render most UI elements as non-functional
 *   - Scrolling may continue to trigger read acknowledgements
 */
export default function useUIState(): readonly ['blueprint' | 'disabled' | undefined] {
  const { uiState } = useWebChatAPIContext();

  return useMemo(() => Object.freeze([uiState]), [uiState]);
}
