/**
 * @jest-environment jsdom
 */

import setupLegacyVersionFamily from './legacy';

beforeEach(() => {
  document.body.innerHTML = '';
});

test('Test loading a bot with full ISO language and a secret', async () => {
  const iframeTask = setupLegacyVersionFamily(
    null,
    {
      botId: 'webchat-mockbot'
    },
    {
      language: 'en-US',
      secret: 'secret'
    },
    ['webchataries']
  );

  document.body.querySelector('iframe').dispatchEvent(new Event('load'));

  await iframeTask;

  expect(document.body).toHaveProperty(
    'outerHTML',
    '<body><div style="height: 100%; overflow: hidden;"><iframe src="/embed/webchat-mockbot?features=webchataries&amp;l=en.en-us&amp;s=secret" style="border: 0px; height: 100%; width: 100%;"></iframe></div></body>'
  );
});

test('Test loading a bot with a 2-letter ISO language and a secret', async () => {
  const iframeTask = setupLegacyVersionFamily(
    null,
    {
      botId: 'webchat-mockbot'
    },
    {
      language: 'fr',
      secret: 'secret'
    }
  );

  document.body.querySelector('iframe').dispatchEvent(new Event('load'));

  await iframeTask;

  expect(document.body).toHaveProperty(
    'outerHTML',
    '<body><div style="height: 100%; overflow: hidden;"><iframe src="/embed/webchat-mockbot?l=fr&amp;s=secret" style="border: 0px; height: 100%; width: 100%;"></iframe></div></body>'
  );
});

test('Test loading a bot with unknown language and a token', async () => {
  const iframeTask = setupLegacyVersionFamily(
    null,
    {
      botId: 'webchat-mockbot'
    },
    {
      language: 'ja.ja-jp',
      token: 'token'
    },
    ['webchatscorpio']
  );

  document.body.querySelector('iframe').dispatchEvent(new Event('load'));

  await iframeTask;

  expect(document.body).toHaveProperty(
    'outerHTML',
    '<body><div style="height: 100%; overflow: hidden;"><iframe src="/embed/webchat-mockbot?features=webchatscorpio&amp;t=token" style="border: 0px; height: 100%; width: 100%;"></iframe></div></body>'
  );
});
