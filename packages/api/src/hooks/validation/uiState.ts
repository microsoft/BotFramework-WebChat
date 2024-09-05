import { fallback, literal, parse, union } from 'valibot';

export function parseUIState(
  input: 'disabled' | 'mock' | undefined,
  disabled?: boolean | undefined
): 'disabled' | 'mock' | undefined {
  // Patching deprecated "disabled" props into "uiState".
  // Priority: uiState > disabled.
  return parse(fallback(union([literal('disabled'), literal('mock')]), disabled ? 'disabled' : undefined), input);
}
