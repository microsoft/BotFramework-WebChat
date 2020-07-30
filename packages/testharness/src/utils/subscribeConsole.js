import intercept from './intercept';

const FUNCTION_NAMES = ['debug', 'error', 'info', 'log', 'trace', 'warn'];

let history = [];

function isDeprecation(text) {
  return text.includes('deprecate');
}

function shiftDeprecationHistory() {
  const deprecation = history.filter(({ args }) => isDeprecation(args[0]));

  history = history.filter(({ args }) => !isDeprecation(args[0]));

  return deprecation;
}

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

export { getHistory, shiftDeprecationHistory };
