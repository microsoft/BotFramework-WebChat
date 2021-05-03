const { Socket } = require('net');

module.exports = function portAlive(host, port) {
  const socket = new Socket();

  return new Promise(resolve => {
    try {
      socket.connect(port, host, () => resolve(true));
    } catch (err) {
      resolve(false);
    }
  }).finally(() => {
    socket.end();
  });
};
