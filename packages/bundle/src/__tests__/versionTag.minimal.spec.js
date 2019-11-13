process.env.npm_package_version = '0.0.0-test';

describe('loading Web Chat', () => {
  test('of variant "minimal" should set META tag', () => {
    require('../index-minimal');

    expect(document.querySelector('head > meta[name="botframework-webchat:bundle:variant"]').content).toBe('minimal');

    expect(document.querySelector('head > meta[name="botframework-webchat:bundle:version"]').content).toBe(
      '0.0.0-test'
    );
  });
});
