import getTranscriptScrollable from '../elements/getTranscriptScrollable';

export default async function scrollToTop(driver) {
  await driver.executeScript(scrollable => {
    scrollable.scrollTop = 0;
  }, await getTranscriptScrollable(driver));
}
