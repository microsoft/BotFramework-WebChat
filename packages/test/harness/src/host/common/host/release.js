module.exports = webDriver =>
  async function release() {
    await webDriver.actions().release().perform();
  };
