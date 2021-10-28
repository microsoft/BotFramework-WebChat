module.exports = webDriver =>
  function pressAndHold(element) {
    return webDriver.actions().move({ origin: element }).press().perform();
  };
