export default function onErrorResumeNext<T>(fn: () => T): T | undefined;
export default function onErrorResumeNext<T>(fn: () => T, defaultValue: T): T;

export default function onErrorResumeNext<T>(fn: () => T, defaultValue?: T): T | undefined {
  try {
    return fn();
  } catch (error) {
    return defaultValue;
  }
}
