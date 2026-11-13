/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

beforeEach(() => {
  delete window.DirectLineSpeech;
});

test.each([['directlinespeech.development.js'], ['directlinespeech.production.min.js']])(
  '%s should set window.DirectLineSpeech with matching buildInfo',
  filename => {
    // Loaded as a module (inside a function), not as a classic <script>: only an explicit assignment reaches `window`.
    jest.requireActual(`../../dist/${filename}`);

    expect(Object.keys(window.DirectLineSpeech).sort()).toEqual(['buildInfo', 'createAdapters']);
    expect(window.DirectLineSpeech.buildInfo).toHaveProperty('buildTool', 'tsup');
    expect(window.DirectLineSpeech.buildInfo).toHaveProperty('moduleFormat', 'global');
  }
);
