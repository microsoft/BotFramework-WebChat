const { readFile } = require('fs').promises;
const { spawn } = require('child_process');

module.exports = async function findHostIP() {
  // https://docs.microsoft.com/en-us/windows/wsl/compare-versions#accessing-windows-networking-apps-from-linux-host-ip
  const procVersion = await readFile('/proc/version');

  if (/wsl2/iu.test(procVersion)) {
    try {
      const childProcess = spawn('hostname', ['-I']);

      return new Promise(resolve => {
        const chunks = [];

        childProcess.stdout.on('data', chunk => chunks.push(chunk));
        childProcess.on('close', () => resolve(Buffer.concat(chunks).toString()));
      });
    } catch (err) {}
  }

  return 'localhost';
};
