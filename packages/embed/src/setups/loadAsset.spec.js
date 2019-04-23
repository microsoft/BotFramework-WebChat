/**
 * @jest-environment jsdom
 */

import loadAsset from './loadAsset';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('Load a JavaScript file', () => {
  let loadTask;

  describe('without subresource integrity', () => {
    beforeEach(() => {
      loadTask = loadAsset('index.js');
    });

    test('failed', async () => {
      const event = new Event('error');

      document.head.querySelector('script').dispatchEvent(event);

      expect(loadTask).rejects.toBe(event);
      expect(document.head).toHaveProperty('outerHTML', '<head><script crossorigin="anonymous" src="index.js"></script></head>');
    });

    test('succeeded', async () => {
      document.head.querySelector('script').dispatchEvent(new Event('load'));

      await loadTask;

      expect(document.head).toHaveProperty('outerHTML', '<head><script crossorigin="anonymous" src="index.js"></script></head>');
    });
  });

  // TODO: jsdom does not support "integrity" attribute yet, the HTML generated does not contains "integrity" attribute.
  //       Try to re-enable the test below in future build.

  // test('with subresource integrity', async () => {
  //   loadTask = loadAsset(['index.js', 'a1b2c3d']);

  //   document.head.querySelector('script').dispatchEvent(new Event('load'));
  //   expect(document.head).toHaveProperty('outerHTML', '<head><script crossorigin="anonymous" integrity="a1b2c3d" src="index.js"></script></head>');

  //   await loadTask;
  // });
});

describe('Load a stylesheet file', () => {
  test('without subresource integrity', () => {
    loadAsset('index.css');

    expect(document.head).toHaveProperty('outerHTML', '<head><link crossorigin="anonymous" href="index.css" rel="stylesheet"></head>');
  });

  // TODO: jsdom does not support "integrity" attribute yet, the HTML generated does not contains "integrity" attribute.
  //       Try to re-enable the test below in future build.

  // test('with subresource integrity', () => {
  //   loadAsset(['index.css', 'a1b2c3d']);

  //   expect(document.head).toHaveProperty('outerHTML', '<head><link crossorigin="anonymous" href="index.css" integrity="a1b2c3d" rel="stylesheet"></head>');
  // });
});
