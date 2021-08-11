/** @jest-environment jsdom */
/* globals process */

process.env.npm_package_version = '0.0.0-test';

describe('loading Web Chat', () => {
  test('of variant "full" should set META tag', () => {
    require('../index');

    expect(document.querySelector('head > meta[name="botframework-webchat:bundle:variant"]').content).toBe('full');

    expect(document.querySelector('head > meta[name="botframework-webchat:bundle:version"]').content).toBe(
      '0.0.0-test'
    );
  });
});
