module.exports = webDriver =>
  function hover(element) {
    return webDriver.actions().move({ origin: element }).perform();
  };
