/**
 * @jest-environment jsdom
 */

import createElement from './setups/createElement';

test('Setup version 4', async () => {
  jest.mock('./fetchJSON', () => jest.fn(() => Promise.resolve({
    botIconURL: 'https://webchat.botframework.com/images/default-bot-icon.png',
    botId: 'webchat-mockbot',
    botName: 'MockBot',
    directLineURL: 'https://directline.botframework.com',
    features: [],
    userId: 'u-12345',
    userIdSrc: 'cookie',
    webSocket: true
  })));

  jest.mock('./setups/loadAsset', () => jest.fn(() => Promise.resolve()));

  window.console.log = () => 0;
  window.fetch = jest.fn(() => Promise.resolve({ text: () => '' }));
  window.WebChat = {
    createDirectLine: jest.fn(options => options),
    renderWebChat: jest.fn((_, element) => {
      element.appendChild(createElement('div', { id: 'webchat' }));
    })
  };

  const mainTask = require('./index').main('?b=webchat-mockbot&l=ja.ja-jp&s=secret&userid=ww&username=William&v=4');

  [].forEach.call(document.querySelectorAll('script'), target => target.dispatchEvent(new Event('load')));

  await mainTask;

  expect(document.title).toBe('MockBot');
  expect(require('./fetchJSON')).toHaveBeenCalledTimes(1);
  expect(require('./fetchJSON')).toHaveBeenCalledWith('/embed/webchat-mockbot/config?s=secret&userid=ww', { credentials: 'include' });
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
