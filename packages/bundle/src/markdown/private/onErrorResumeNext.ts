export default function onErrorResumeNext<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch (error) {
    // Return undefined.
  }
}
