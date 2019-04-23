/**
 * @jest-environment jsdom
 */

import setupVersion4 from './version4';

beforeEach(() => {
  delete window.WebChat;
});

test('Load Web Chat v4', async () => {
  window.WebChat = {
    createDirectLine: jest.fn(() => ({})),
    renderWebChat: jest.fn((props, element) => {
      expect(props).toEqual({
        directLine: {},
        locale: 'ja-JP',
        styleOptions: {
          botAvatarImage: 'https://webchat.botframework.com/images/default-bot-icon.png'
        },
        userId: 'u-12345',
        username: 'William'
      });

      element.appendChild(document.createElement('div'));

      const meta = document.createElement('meta');

      meta.setAttribute('name', 'botframework-webchat:bundle:version');
      meta.setAttribute('content', '0.0.0');

      document.head.appendChild(meta);
    })
  };

  const setupTask = setupVersion4({
    assets: ['webchat.js', 'a1b2c3d']
  }, {
    botIconURL: 'https://webchat.botframework.com/images/default-bot-icon.png',
    directLineURL: 'https://directline.botframework.com',
    userId: 'u-12345',
    webSocket: true
  }, {
    language: 'ja-JP',
    secret: 'secret',
    token: 'token',
    username: 'William'
  });

  expect(document.head).toHaveProperty('outerHTML', '<head><script crossorigin="anonymous" src="webchat.js"></script><script crossorigin="anonymous" src="a1b2c3d"></script></head>');
  [].forEach.call(document.head.querySelectorAll('script'), target => target.dispatchEvent(new Event('load')));

  const { version } = await setupTask;

  expect(window.WebChat.createDirectLine).toHaveBeenCalledTimes(1);
  expect(window.WebChat.createDirectLine).toHaveBeenCalledWith({
    domain: 'https://directline.botframework.com',
    secret: 'secret',
    token: 'token',
    webSocket: true
  });

  expect(document.body).toHaveProperty('outerHTML', '<body><div style="height: 100%;"><div style="height: 100%;"></div></div></body>');

  expect(version).toBe('0.0.0');
});
