export default function unwrapIfValiError<T>(error: T): Error | T {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.includes('middleware must return value constructed by reactComponent()')
  ) {
    const wrappedError = new Error(
      `botframework-webchat: middleware must return value constructed by their corresponding factory function`
    );

    wrappedError.cause = error;

    return wrappedError;
  }

  return error;
}
