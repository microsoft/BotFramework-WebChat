module.exports = webDriver =>
  function sendDevToolsCommand(command, options) {
    return webDriver.sendDevToolsCommand(command, options);
  };
