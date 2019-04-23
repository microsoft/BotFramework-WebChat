/**
 * @jest-environment jsdom
 */

import createElement from './createElement';
import setupVersion3 from './version3';

beforeEach(() => {
  delete window.BotChat;
});

test('Load Web Chat v3 without speech token', async () => {
  window.BotChat = {
    App: jest.fn((props, element) => {
      expect(props).toEqual({
        directLine: {
          domain: 'https://directline.botframework.com',
          secret: 'secret',
          token: 'token',
          webSocket: true
        },
        bot: {
          id: 'webchat-mockbot'
        },
        locale: 'ja-JP',
        resize: 'window',
        speechOptions: undefined,
        user: {
          id: 'u-12345',
          name: 'William'
        }
      });

      element.appendChild(createElement('div', { id: 'webchat' }));
    })
  };

  const setupTask = setupVersion3({
    assets: [
      ['botchat.css', 'a1b2c3d']
      ['botchat.js', 'a1b2c3d']
    ]
  }, {
    botId: 'webchat-mockbot',
    directLineURL: 'https://directline.botframework.com',
    userId: 'u-12345',
    webSocket: true
  }, {
    language: 'ja-JP',
    secret: 'secret',
    token: 'token',
    username: 'William'
  });

  // expect(document.head).toHaveProperty('outerHTML', '<head><script crossorigin="anonymous" src="webchat.js"></script><script crossorigin="anonymous" src="a1b2c3d"></script></head>');
  [].forEach.call(document.head.querySelectorAll('script'), target => target.dispatchEvent(new Event('load')));

  const { version } = await setupTask;

  expect(window.BotChat.App).toHaveBeenCalledTimes(1);
  expect(document.body).toHaveProperty('outerHTML', '<body><div><div id="webchat"></div></div></body>');
  expect(version).toBe('3');
});
