// In dev mode, draw a green tick when test succeeded.

const checkAccessibility = require('../../common/host/checkAccessibility');
const dumpLogs = require('../../common/dumpLogs');
const override = require('../utils/override');

// Send the completion back to the browser console.
module.exports = (webDriver, done) =>
  override(done, undefined, async () => {
    await checkAccessibility(webDriver)();

    /* istanbul ignore next */
    await webDriver.executeScript(() => {
      console.log(
        '%c✔️ DONE%c',
        'background-color: green; border-radius: 4px; color: white; font-size: 200%; padding: 2px 4px;',
        ''
      );

      // This code is running in browser VM where "document" is available.
      // eslint-disable-next-line no-undef
      const div = document.createElement('div');

      div.setAttribute(
        'style',
        'align-items: center; background-color: green; border: solid 4px black; border-radius: 10px; bottom: 10px; display: flex; font-size: 60px; height: 100px; justify-content: center; position: fixed; right: 10px; width: 100px;'
      );

      div.textContent = '✔️';

      // This code is running in browser VM where "document" is available.
      // eslint-disable-next-line no-undef
      document.body.appendChild(div);
    });

    await dumpLogs(webDriver, { clear: true });

    global.__logs = [];
  });
