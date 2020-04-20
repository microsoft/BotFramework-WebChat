import createCustomEvent from '../src/createCustomEvent';

test.each([
  [
    'Modern browsers with custom event',
    { modernBrowsers: true, name: 'click', eventInitDict: { detail: 123 } }
  ],
  [
    'Modern browsers with error event',
    { modernBrowsers: true, name: 'error', eventInitDict: { error: new Error('artificial') } }
  ],
  ['IE11 with custom event', { modernBrowsers: true, name: 'load', eventInitDict: { detail: 123 } }],
  ['IE11 with error event', { modernBrowsers: true, name: 'error', eventInitDict: { error: new Error('artificial') } }]
])('%s', (_, { modernBrowsers, name, eventInitDict }) => {
  if (!modernBrowsers) {
    global.Event = {};
  }

  const event = createCustomEvent(name, eventInitDict);

  expect(event).toHaveProperty('type', name);

  Object.entries(eventInitDict).forEach(([key, value]) => {
    expect(event).toHaveProperty(key, value);
  });
});
