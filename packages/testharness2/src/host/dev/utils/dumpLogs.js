const getLogs = require('../../common/getLogs');

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
  const logs = await getLogs(webDriver, { clear });

  logs.length && console.log(formatLogEntries(logs));
};
