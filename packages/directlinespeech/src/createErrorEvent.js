export default function createErrorEvent(error) {
  const errorEvent = new Event('error');

  errorEvent.error = error;

  return errorEvent;
}
