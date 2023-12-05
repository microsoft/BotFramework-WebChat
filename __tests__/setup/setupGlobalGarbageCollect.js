// Workaround from https://github.com/jestjs/jest/issues/7874.

// eslint-disable-next-line no-undef
afterAll(() => global.gc?.());
