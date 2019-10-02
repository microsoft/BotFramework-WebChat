/**
 * @jest-environment jsdom
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
