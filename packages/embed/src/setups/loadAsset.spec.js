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
      expect(document.head).toHaveProperty(
        'outerHTML',
        '<head><script async="" crossorigin="anonymous" src="index.js"></script></head>'
      );
    });

    test('succeeded', async () => {
      document.head.querySelector('script').dispatchEvent(new Event('load'));

      await loadTask;

      expect(document.head).toHaveProperty(
        'outerHTML',
        '<head><script async="" crossorigin="anonymous" src="index.js"></script></head>'
      );
    });
  });

  test('with subresource integrity', async () => {
    loadTask = loadAsset(['index.js', 'sha384-a1b2c3d']);

    document.head.querySelector('script').dispatchEvent(new Event('load'));
    expect(document.head).toHaveProperty(
      'outerHTML',
      '<head><script async="" crossorigin="anonymous" integrity="sha384-a1b2c3d" src="index.js"></script></head>'
    );

    await loadTask;
  });
});

describe('Load a stylesheet file', () => {
  test('without subresource integrity', () => {
    loadAsset('index.css');

    expect(document.head).toHaveProperty(
      'outerHTML',
      '<head><link crossorigin="anonymous" href="index.css" rel="stylesheet"></head>'
    );
  });

  test('with subresource integrity', () => {
    loadAsset(['index.css', 'sha384-a1b2c3d']);

    expect(document.head).toHaveProperty(
      'outerHTML',
      '<head><link crossorigin="anonymous" href="index.css" integrity="sha384-a1b2c3d" rel="stylesheet"></head>'
    );
  });
});
