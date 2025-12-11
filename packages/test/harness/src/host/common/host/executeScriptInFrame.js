/* eslint-env browser */
/* eslint-disable no-magic-numbers */
const { Condition } = require('selenium-webdriver');

module.exports = webDriver =>
  async function executeScriptInFrame(element, fnString) {
    const parentLocationHref = await webDriver.executeScript(() => document.location.href);

    await webDriver.switchTo().frame(element);

    await webDriver.wait(
      new Condition('until switched to IFRAME', async webDriver => {
        // We only have #document and cannot send WebElement from other frames (it would crash silently.)
        // The only way to detect when we switch frame is check if `document.location.href` changed to something new.

        // Few things we tried:
        // - Use HTMLIFrameElement.src, however, the #document could have different URL due to 304
        // - Send WebElement, it crash silently
        // - Set #hash, the page would reload

        const locationHref = await webDriver.executeScript(() => document.location.href);

        return locationHref !== parentLocationHref;
      }),
      5000
    );

    await webDriver.executeScript(`(${fnString})()`);

    await webDriver.switchTo().defaultContent();
  };
