// TODO: Test harness and page objects should move to TypeScript.
// TODO: We should use @testing-library/dom instead.
export default function byTestId(testId) {
  return document.querySelector(`[data-testid="${testId}"]`);
}
