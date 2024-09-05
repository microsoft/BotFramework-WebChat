import useWebChatAPIContext from './internal/useWebChatAPIContext';

const TRUE_STATE = Object.freeze([true] as const);
const FALSE_STATE = Object.freeze([false] as const);

/**
 * @deprecated Please use `useUIState() === 'disabled'` instead. This hook will be removed on or after 2026-09-04.
 */
export default function useDisabled(): readonly [boolean] {
  return useWebChatAPIContext().uiState === 'disabled' ? TRUE_STATE : FALSE_STATE;
}
