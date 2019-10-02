import { embedConfigurationURL, embedTelemetryURL, legacyEmbedURL } from './urlBuilder';

test('Create embed configuration URL with both secret and token', () => {
  const actual = embedConfigurationURL('webchat-mockbot', { secret: 'secret', token: 'token', userId: 'u-12345' });

  expect(actual).toBe('/embed/webchat-mockbot/config?t=token&userid=u-12345');
});

test('Create embed configuration URL with secret only', () => {
  const actual = embedConfigurationURL('webchat-mockbot', { secret: 'secret' });

  expect(actual).toBe('/embed/webchat-mockbot/config?s=secret');
});

test('Create embed telemetry URL with both secret and token', () => {
  const actual = embedTelemetryURL('webchat-mockbot', { secret: 'secret', token: 'token' }, ['abc', 'def', 'xyz']);

  expect(actual).toBe('/embed/webchat-mockbot/telemetry?t=token&p=abc%2Cdef%2Cxyz');
});

test('Create embed telemetry URL with secret only', () => {
  const actual = embedTelemetryURL('webchat-mockbot', { secret: 'secret' }, ['abc', 'def', 'xyz']);

  expect(actual).toBe('/embed/webchat-mockbot/telemetry?s=secret&p=abc%2Cdef%2Cxyz');
});

test('Create legacy embed URL', () => {
  const actual = legacyEmbedURL('webchat-mockbot', new URLSearchParams({ s: 'secret' }));

  expect(actual).toBe('/embed/webchat-mockbot?s=secret');
});
