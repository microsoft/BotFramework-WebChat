module.exports = webDriver => {
  return function sendDevToolsCommand(command, options) {
    return webDriver.sendDevToolsCommand(command, options);
  };
};
