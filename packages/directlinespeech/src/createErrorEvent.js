import createCustomEvent from './createCustomEvent';

export default function createErrorEvent(error) {
  return createCustomEvent('error', { error });
}
