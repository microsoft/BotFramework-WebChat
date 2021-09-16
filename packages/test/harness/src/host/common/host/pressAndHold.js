module.exports = webDriver => {
  return function pressAndHold(element) {
    return webDriver.actions().move({ origin: element }).press().perform();
  };
};
