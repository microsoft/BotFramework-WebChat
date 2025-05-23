/**
 * @jest-environment @happy-dom/jest-environment
 */

import setupAries from './aries';

test('Load using Aries', async () => {
  const loadTask = setupAries({}, { botId: 'webchat-mockbot' }, { language: 'ja-JP', secret: 'secret' });

  document.body.querySelector('iframe').dispatchEvent(new Event('load'));

  await loadTask;

  expect(document.body).toHaveProperty(
    'outerHTML',
    '<body><div style="height: 100%; overflow: hidden;"><iframe src="/embed/webchat-mockbot?features=webchataries&amp;l=ja.ja-jp&amp;s=secret" style="border: 0px; height: 100%; width: 100%;"></iframe></div></body>'
  );
});
