const { readFile } = require('fs').promises;
const isWSL2 = require('./isWSL2');

/** Finds the Windows (host) IP address when running under WSL2. */
module.exports = async function findHostIP() {
  if (await isWSL2()) {
    try {
      const content = await readFile('/etc/resolv.conf');

      return /^nameserver\s(.*)/mu.exec(content)[1];

      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  return 'localhost';
};
