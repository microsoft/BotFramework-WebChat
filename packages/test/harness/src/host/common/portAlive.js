// const { Socket } = require('net');

// module.exports = function portAlive(host, port, duration = 200) {
//   const socket = new Socket();

//   return Promise.race([
//     new Promise(resolve => setTimeout(resolve, duration)),
//     new Promise(resolve => {
//       try {
//         socket.connect(port, host, () => resolve(true));
//       } catch (err) {
//         resolve(false);
//       }
//     }).finally(() => {
//       socket.end();
//     })
//   ]);
// };
