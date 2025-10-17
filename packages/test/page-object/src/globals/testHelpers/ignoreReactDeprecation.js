import { spyOn } from 'jest-mock';

export default function ignoreReactDeprecation(init = {}) {
  const consoleError = console.error.bind(console);

  spyOn(console, 'error').mockImplementation((...args) => {
    let shouldIgnore = false;

    if (
      init.defaultProps &&
      typeof args[0] === 'string' &&
      args[0].includes(
        'Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.'
      )
    ) {
      shouldIgnore = true;
    }

    shouldIgnore || consoleError(...args);
  });
}
