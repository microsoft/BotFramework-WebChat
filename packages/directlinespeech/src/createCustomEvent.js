export default function createCustomEvent(name, eventInitDict = {}) {
  if (name === 'error') {
    if (typeof ErrorEvent === 'function') {
      return new ErrorEvent(name, eventInitDict);
    }
  } else if (typeof CustomEvent === 'function') {
    return new CustomEvent(name, eventInitDict);
  }

  const event = document.createEvent('Event');

  event.initEvent(name, true, true);

  Object.entries(eventInitDict).forEach(([name, value]) => {
    event[name] = value;
  });

  return event;
}
