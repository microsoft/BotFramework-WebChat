import { isForbiddenPropertyName } from 'botframework-webchat-core';

export default function shallowEqual(x, y) {
  if (x === y) {
    return true;
  }

  const xKeys = Object.keys(x);
  const yKeys = Object.keys(y);

  return (
    xKeys.length === yKeys.length &&
    // Mitigated through denylisting.
    // eslint-disable-next-line security/detect-object-injection
    xKeys.every(key => !isForbiddenPropertyName(key) && yKeys.includes(key) && x[key] === y[key])
  );
}
