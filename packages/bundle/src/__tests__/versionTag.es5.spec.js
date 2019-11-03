// We did not explicitly include React in package.json, thus, it is loading React 0.14.9.
jest.mock('react', () => ({ createContext: () => {} }));

process.env.npm_package_version = '0.0.0-test';

describe('loading Web Chat', () => {
  test('of variant "es5" should set META tag', () => {
    require('../index-es5');

    expect(document.querySelector('head > meta[name="botframework-webchat:bundle:variant"]').content).toBe('full-es5');

    expect(document.querySelector('head > meta[name="botframework-webchat:bundle:version"]').content).toBe(
      '0.0.0-test'
    );
  });
});
