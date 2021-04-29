const { readFile } = require('fs').promises;

module.exports = async function findHostIP() {
  // https://docs.microsoft.com/en-us/windows/wsl/compare-versions#accessing-windows-networking-apps-from-linux-host-ip
  const procVersion = await readFile('/proc/version');

  if (/wsl2/iu.test(procVersion)) {
    try {
      const content = await readFile('/etc/resolv.conf');

      return /^nameserver\s(.*)/mu.exec(content)[1];
    } catch (err) {}
  }

  return 'localhost';
};
