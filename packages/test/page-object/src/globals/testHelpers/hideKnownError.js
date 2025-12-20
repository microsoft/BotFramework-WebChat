import { spyOn } from 'https://esm.sh/jest-mock';

export default function hideKnownError() {
  const consoleError = console.error.bind(console);

  spyOn(console, 'error').mockImplementation((...args) => {
    const [message] = args;

    if (
      typeof message !== 'string' ||
      !(
        message.includes(
          'Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.'
        ) ||
        message.includes('ReactDOM.render is no longer supported in React 18. Use createRoot instead.') ||
        // TODO: [P0] We should fix the "Cannot update a component while rendering a different component" error.
        (message.includes('Cannot update a component') && message.includes('while rendering a different component'))
      )
    ) {
      consoleError(...args);
    }
  });
}
