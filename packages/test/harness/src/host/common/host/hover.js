module.exports = webDriver => {
  return function hover(element) {
    return webDriver.actions().move({ origin: element }).perform();
  };
};
