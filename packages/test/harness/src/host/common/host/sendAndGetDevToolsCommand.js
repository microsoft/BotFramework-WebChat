module.exports = webDriver =>
  function sendAndGetDevToolsCommand(command, options) {
    return webDriver.sendAndGetDevToolsCommand(command, options);
  };
