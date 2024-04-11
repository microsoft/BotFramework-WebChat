// TODO: We should build actions() instead.
module.exports = webDriver =>
  async function dragAndHold(draggable, droppable) {
    await webDriver.actions().move({ origin: draggable }).press().move({ origin: droppable }).perform();
  };
