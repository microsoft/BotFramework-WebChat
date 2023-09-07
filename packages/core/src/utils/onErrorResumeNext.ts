export default function onErrorResumeNext<T>(fn: () => T): T | undefined;
export default function onErrorResumeNext<T, U = T>(fn: () => T, defaultValue: U): T | U;

/**
 * Calls the function and returns its return value.
 *
 * If the function failed, return default value if specified, otherwise, `undefined`.
 */
export default function onErrorResumeNext<T>(fn: () => T, defaultValue?: T): T | undefined {
  try {
    return fn();
  } catch (error) {
    return defaultValue;
  }
}
