const { spawn } = require('child_process');
const isWSL2 = require('./isWSL2');

/** Finds the Linux IP address when running under WSL2. */
module.exports = async function findLocalIP() {
  if (await isWSL2()) {
    try {
      const childProcess = spawn('hostname', ['-I']);

      return new Promise(resolve => {
        const chunks = [];

        childProcess.stdout.on('data', chunk => chunks.push(chunk));
        childProcess.on('close', () => resolve(Buffer.concat(chunks).toString()));
      });

      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  return 'localhost';
};
