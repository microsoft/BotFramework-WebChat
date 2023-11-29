export default function assertNotNullOrUndefined<T>(
  value: null | T | undefined,
  message: string = 'Value should not be undefined.'
): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}
