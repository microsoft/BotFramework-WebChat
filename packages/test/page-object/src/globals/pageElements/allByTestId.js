import root from './root';

// TODO: Test harness and page objects should move to TypeScript.
// TODO: We should use @testing-library/dom instead.
export default function allByTestId(testId) {
  return root().querySelectorAll(`[data-testid="${testId}"]`);
}
