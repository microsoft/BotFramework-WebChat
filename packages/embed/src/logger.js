function createLog(log, prefix) {
  return message => log([prefix, message].join(' '));
}

const error = createLog(console.error.bind(console), 'Web Chat:');
const log = createLog(console.log.bind(console), 'Web Chat:');
const warn = createLog(console.warn.bind(console), 'Web Chat:');

export { error, log, warn };
