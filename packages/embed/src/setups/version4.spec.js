/**
 * @jest-environment jsdom
 */

import setupVersion4 from './version4';

test('Load Web Chat v4', async () => {
  window.WebChat = {
    createDirectLine: jest.fn(),
    renderWebChat: jest.fn()
  };

  setupVersion4({
    assets: ['webchat.js', 'a1b2c3d']
  }, {
    botIconURL: 'https://webchat.botframework.com/images/default-bot-icon.png',
    domain: 'https://directline.botframework.com',
    userId: 'u-12345',
    webSocket: true
  }, {
    language: 'ja-JP',
    secret: 'secret',
    token: 'token',
    username: 'William'
  });

  expect(document.head).toHaveProperty('outerHTML', '<head><script crossorigin="anonymous" src="webchat.js"></script><script crossorigin="anonymous" src="a1b2c3d"></script></head>');
});
