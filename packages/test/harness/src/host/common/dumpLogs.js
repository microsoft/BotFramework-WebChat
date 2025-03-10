/* eslint no-magic-numbers: ["error", { "ignore": [0, 2, 1000] }] */

const getBrowserLogs = require('./getBrowserLogs');

function formatLogEntries(entries) {
  return entries
    .map(({ level: { name }, message }) => {
      let text = message.split(' ').slice(2).join(' ');

      if (text.length > 1000) {
        text = text.slice(0, 1000) + '…';
      }

      return `📃 [${name}] ${text}`;
    })
    .join('\n');
}

module.exports = async function dumpLogs(webDriver, { clear } = {}) {
  let logs;

  try {
    logs = await getBrowserLogs(webDriver, { clear });
  } catch (err) {
    logs = [];
  }

  logs.length && console.log(formatLogEntries(logs));
};
