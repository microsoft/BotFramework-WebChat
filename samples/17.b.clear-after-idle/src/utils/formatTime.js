export default (ms = 0) =>
  `${Math.floor(ms / 60000)}:${("0" + (Math.floor(ms / 1000) % 60)).slice(-2)}`;
