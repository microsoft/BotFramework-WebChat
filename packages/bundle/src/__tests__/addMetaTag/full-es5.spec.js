/** @jest-environment @happy-dom/jest-environment */

describe('importing full (ES5) bundle', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {
      // Intentionally left blank.
    });

    // "adaptivecards" is trying to load "swiper", which is ESM only, mocking it
    jest.mock('swiper', () => ({}));
    jest.requireActual('../../../dist/botframework-webchat.es5.js');
  });

  test('should have injected <meta> tag', () => {
    const metaMap = new Map(
      Array.from(document.querySelectorAll('meta'))
        .filter(({ name }) => name.startsWith('botframework-webchat'))
        .map(({ content, name }) => [name, content])
    );

    expect(metaMap.has('botframework-webchat:bundle')).toBe(true);

    expect(
      metaMap
        .get('botframework-webchat:bundle')
        .split(';')
        .map(value => value.trim())
    ).toEqual(expect.arrayContaining(['build-tool=tsup', 'module-format=commonjs']));

    expect(metaMap.get('botframework-webchat:bundle:variant')).toBe('full-es5');
  });
});
