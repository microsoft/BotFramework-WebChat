/**
 * @jest-environment jsdom
 */

import createElement from './setups/createElement';

beforeEach(() => {
  window.console.log = () => 0;
  window.console.warn = () => 0;
});

test('Setup version 4', async () => {
  jest.mock('./fetchJSON', () =>
    jest.fn(() =>
      Promise.resolve({
        botIconURL: 'https://webchat.botframework.com/images/default-bot-icon.png',
        botId: 'webchat-mockbot',
        botName: 'MockBot',
        directLineURL: 'https://directline.botframework.com',
        features: [],
        userId: 'u-12345',
        userIdSrc: 'cookie',
        webSocket: true
      })
    )
  );

  jest.mock('./setups/loadAsset', () => jest.fn(() => Promise.resolve()));

  window.fetch = jest.fn(() => Promise.resolve({ text: () => '' }));
  window.WebChat = {
    createDirectLine: jest.fn(options => options),
    renderWebChat: jest.fn((_, element) => {
      element.appendChild(createElement('div', { id: 'webchat' }));
    })
  };

  const mainTask = require('./index').default('?b=webchat-mockbot&l=ja.ja-jp&s=secret&userid=ww&username=William&v=4');

  [].forEach.call(document.querySelectorAll('script'), target => target.dispatchEvent(new Event('load')));

  await mainTask;

  expect(document.title).toBe('MockBot');
  expect(require('./fetchJSON')).toHaveBeenCalledTimes(1);
  expect(require('./fetchJSON')).toHaveBeenCalledWith('/embed/webchat-mockbot/config?s=secret&userid=ww', {
    credentials: 'include'
  });
  expect(window.WebChat.createDirectLine).toHaveBeenCalledTimes(1);
  expect(window.WebChat.renderWebChat).toHaveBeenCalledTimes(1);

  expect(window.WebChat.renderWebChat.mock.calls[0][0]).toEqual({
    directLine: {
      domain: 'https://directline.botframework.com',
      secret: 'secret',
      token: undefined,
      webSocket: true
    },
    locale: 'ja-JP',
    styleOptions: {
      botAvatarImage: 'https://webchat.botframework.com/images/default-bot-icon.png'
    },
    userId: 'u-12345',
    username: 'William'
  });

  expect(document.body.querySelectorAll('#webchat')).toHaveProperty('length', 1);
});

test('Find default version', () => {
  const targetVersion = {
    assets: [['webchat.js', 'sha384-a1b2c3d']],
    versionFamily: '4'
  };

  const service = require('./index').findService({
    versions: {
      default: {
        redirects: [['*', '4.3.0']]
      },
      '4.3.0': targetVersion
    }
  });

  expect(service).toBe(targetVersion);
});

test('Find targeted version using query parameters', () => {
  const targetVersion = {
    assets: [['webchat.js', 'sha384-a1b2c3d']],
    versionFamily: '4'
  };

  const service = require('./index').findService(
    {
      versions: {
        default: {
          redirects: [['*', '4.1.0']]
        },
        '4.3.0': targetVersion
      }
    },
    {},
    '4.3.0'
  );

  expect(service).toBe(targetVersion);
});

test('Find targeted version using features', () => {
  const targetVersion = {
    assets: [['webchat.js', 'sha384-a1b2c3d']],
    versionFamily: '4'
  };

  const service = require('./index').findService(
    {
      versions: {
        default: {
          redirects: [['feature:nextmajor', '4.3.0'], ['*', '4.2.0']]
        },
        '4.3.0': targetVersion
      }
    },
    { features: ['nextmajor'] }
  );

  expect(service).toBe(targetVersion);
});

test('Missing version should redirect to default version', () => {
  const targetVersion = {
    assets: [['webchat.js', 'sha384-a1b2c3d']],
    versionFamily: '4'
  };

  const service = require('./index').findService(
    {
      versions: {
        default: {
          redirects: [['*', '4.3.0']]
        },
        '4.3.0': targetVersion
      }
    },
    {},
    '4.0.0'
  );

  expect(service).toBe(targetVersion);
});
