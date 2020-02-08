import getTranscriptScrollable from '../elements/getTranscript.js';

export default async function scrollToTop(driver) {
  await driver.executeScript(scrollable => {
    scrollable.scrollTop = 0;
  }, await getTranscriptScrollable(driver));
}
