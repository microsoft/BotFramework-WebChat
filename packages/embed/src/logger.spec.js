const errors = [];
const logs = [];
const warns = [];

global.console = {
  error: (...args) => errors.push(...args),
  log: (...args) => logs.push(...args),
  warn: (...args) => warns.push(...args)
};

const { error, log, warn } = require('./logger');

test('Log', () => {
  log('Hello');

  expect(logs).toEqual(['Web Chat: Hello']);
});

test('Warn', () => {
  warn('Hello');

  expect(warns).toEqual(['Web Chat: Hello']);
});

test('Error', () => {
  error('Hello');

  expect(errors).toEqual(['Web Chat: Hello']);
});
