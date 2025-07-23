/** @jest-environment @happy-dom/jest-environment */

describe('importing minimal bundle', () => {
  beforeEach(() => {
    jest.requireActual('../../../dist/botframework-webchat.minimal.mjs');
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
    ).toEqual(expect.arrayContaining(['build-tool=tsup', 'module-format=esmodules']));

    expect(metaMap.get('botframework-webchat:bundle:variant')).toBe('minimal');
  });
});
