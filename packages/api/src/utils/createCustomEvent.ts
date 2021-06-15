export default function createCustomEvent<T>(
  name: string,
  eventInitDict: T
): {
  type: string;
} & T {
  let event: Event;

  if (typeof CustomEvent === 'function') {
    event = new CustomEvent(name);
  } else {
    event = document.createEvent('Event');

    event.initEvent(name, true, true);
  }

  Object.entries(eventInitDict).forEach(([key, value]) => {
    event[key] = value;
  });

  return event as any;
}
