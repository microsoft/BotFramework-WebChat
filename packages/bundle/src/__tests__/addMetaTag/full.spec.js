/** @jest-environment @happy-dom/jest-environment */

describe('importing full bundle', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {
      // Intentionally left blank.
    });

    // "adaptivecards" is trying to load "swiper", which is ESM only, mocking it
    jest.mock('swiper', () => ({}));
    jest.requireActual('../../../dist/botframework-webchat.js');
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

    expect(metaMap.get('botframework-webchat:bundle:variant')).toBe('full');
  });
});
