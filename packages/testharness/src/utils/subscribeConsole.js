import intercept from './intercept';

const FUNCTION_NAMES = ['debug', 'error', 'info', 'log', 'trace', 'warn'];

const history = [];

function getHistory() {
  return history;
}

export default function subscribeConsole() {
  const originalConsole = FUNCTION_NAMES.map(name => console[name]);

  FUNCTION_NAMES.forEach(
    name =>
      (console[name] = intercept(console[name].bind(console), next => (...args) => {
        history.push({
          args: args.map(arg => (arg instanceof Error ? arg.stack : arg + '')),
          level: name
        });

        return next(...args);
      }))
  );

  return () => {
    FUNCTION_NAMES.forEach(name => {
      console[name] = originalConsole[name];
    });
  };
}

export { getHistory }
