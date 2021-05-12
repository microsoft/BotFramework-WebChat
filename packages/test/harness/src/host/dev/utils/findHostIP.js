const { readFile } = require('fs').promises;
const isWSL2 = require('./isWSL2');

/** Finds the Windows (host) IP address when running under WSL2. */
module.exports = async function findHostIP() {
  if (await isWSL2()) {
    try {
      // https://docs.microsoft.com/en-us/windows/wsl/wsl-config#configure-global-options-with-wslconfig
      const content = await readFile('/etc/resolv.conf');

      return /^nameserver\s(.*)/mu.exec(content)[1];

      // `/etc/resolv.conf` can be disabled via `.wslconfig`, then, fallback to `localhost`.
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  return 'localhost';
};
