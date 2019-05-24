/**
 * @jest-environment jsdom
 */

import createElement from './createElement';
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

      element.appendChild(createElement('div', { id: 'webchat' }));

      document.head.appendChild(
        createElement('meta', {
          content: '4.0.0',
          name: 'botframework-webchat:bundle:version'
        })
      );
    })
  };

  const setupTask = setupVersion4(
    {
      assets: [['webchat.js', 'sha384-a1b2c3d']]
    },
    {
      botIconURL: 'https://webchat.botframework.com/images/default-bot-icon.png',
      directLineURL: 'https://directline.botframework.com',
      userId: 'u-12345',
      webSocket: true
    },
    {
      language: 'ja-JP',
      secret: 'secret',
      token: 'token',
      username: 'William'
    }
  );

  expect(document.head).toHaveProperty(
    'outerHTML',
    '<head><script async="" crossorigin="anonymous" integrity="sha384-a1b2c3d" src="webchat.js"></script></head>'
  );
  [].forEach.call(document.head.querySelectorAll('script'), target => target.dispatchEvent(new Event('load')));

  const { version } = await setupTask;

  expect(window.WebChat.createDirectLine).toHaveBeenCalledTimes(1);
  expect(window.WebChat.createDirectLine).toHaveBeenCalledWith({
    domain: 'https://directline.botframework.com',
    secret: 'secret',
    token: 'token',
    webSocket: true
  });

  expect(document.body).toHaveProperty(
    'outerHTML',
    '<body><div style="height: 100%;"><div id="webchat" style="height: 100%;"></div></div></body>'
  );

  expect(version).toBe('4.0.0');
});
