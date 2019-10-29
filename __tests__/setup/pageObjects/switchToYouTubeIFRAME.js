import { By, Condition, until } from 'selenium-webdriver';
import { timeouts } from '../../constants.json';

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export default async function switchToYouTubeIFRAME(driver) {
  const iframeSelector = By.css('iframe[src^="https://youtube.com/"]');

  await driver.wait(until.elementLocated(iframeSelector), timeouts.fetch);

  const iframe = await driver.findElement(iframeSelector);

  await driver.switchTo().frame(iframe);

  // TODO: [P2] Workaround the bug or bump selenium-webdriver
  //            selenium-webdriver has a bug that frame switching is not complete until 2 seconds later.
  //            There is currently no workaround other than sleeping.
  await sleep(timeouts.fetch);

  await driver.wait(
    new Condition('until switched to IFRAME', async driver =>
      /^https:\/\/www.youtube.com\//.test(await driver.executeScript(() => document.location.href))
    ),
    timeouts.fetch
  );
}
