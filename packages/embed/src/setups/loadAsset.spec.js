/**
 * @jest-environment jsdom
 */

import loadAsset from './loadAsset';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('Load a JavaScript file', () => {
  let loadTask;

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

describe('Load a stylesheet file', () => {
  loadAsset('index.css');

  expect(document.head).toHaveProperty('outerHTML', '<head><link crossorigin="anonymous" href="index.css" rel="stylesheet"></head>');
});
