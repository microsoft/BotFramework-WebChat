/* global axe */

module.exports = webDriver =>
  async function snapshot() {
    const [error, results] = await webDriver.executeAsyncScript(callback =>
      axe.run().then(results => callback([undefined, results], error => callback([error])))
    );

    if (error) {
      throw error;
    }

    if (results.violations.length) {
      console.log(results);

      throw new Error('Accessibility violations found.');
    }
  };
