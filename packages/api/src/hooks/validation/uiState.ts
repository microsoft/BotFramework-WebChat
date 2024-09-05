import { fallback, literal, parse, union } from 'valibot';

export function parseUIState(
  input: 'blueprint' | 'disabled' | undefined,
  disabled?: boolean | undefined
): 'blueprint' | 'disabled' | undefined {
  // Patching deprecated "disabled" props into "uiState".
  // Priority: uiState > disabled.
  return parse(fallback(union([literal('blueprint'), literal('disabled')]), disabled ? 'disabled' : undefined), input);
}
