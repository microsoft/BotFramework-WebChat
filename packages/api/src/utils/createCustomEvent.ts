import { isForbiddenPropertyName } from 'botframework-webchat-core';

export default function createCustomEvent<T, N extends string>(
  name: N,
  eventInitDict: T
): {
  type: N;
} & T {
  let event: Event;

  if (typeof CustomEvent === 'function') {
    event = new CustomEvent(name);
  } else {
    event = document.createEvent('Event');

    event.initEvent(name, true, true);
  }

  Object.entries(eventInitDict).forEach(([key, value]) => {
    if (!isForbiddenPropertyName(key)) {
      // Mitigation through denylisting.
      // eslint-disable-next-line security/detect-object-injection
      event[key] = value;
    }
  });

  return event as any;
}
