const { readFile } = require('fs').promises;

/** Returns `true` if running under WSL2, otherwise, `false`. */
module.exports = async function isWSL2() {
  try {
    // https://docs.microsoft.com/en-us/windows/wsl/compare-versions#accessing-windows-networking-apps-from-linux-host-ip
    const procVersion = await readFile('/proc/version');

    return /wsl2/iu.test(procVersion);
  } catch (err) {
    return false;
  }
};
