module.exports = function indent(message, count = 4) {
  const indentation = new Array(count).fill(' ').join('');

  return message
    .split('\n')
    .map(line => indentation + line)
    .join('\n');
};
