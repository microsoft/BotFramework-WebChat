/**
 * happy-dom@21 fires "error" on every <iframe> unless page loading is enabled; the tests fire "load" themselves.
 *
 * @jest-environment @happy-dom/jest-environment
 * @jest-environment-options {"settings": {"enableIframePageLoading": true}}
 */

import loadIFRAME from './loadIFRAME';

test('Load a page', async () => {
  const loadTask = loadIFRAME('index.html');

  document.body.querySelector('iframe').dispatchEvent(new Event('load'));

  await loadTask;

  expect(document.body.firstChild).toHaveProperty(
    'outerHTML',
    '<div style="height: 100%; overflow: hidden;"><iframe src="index.html" style="border: 0px; height: 100%; width: 100%;"></iframe></div>'
  );
});
