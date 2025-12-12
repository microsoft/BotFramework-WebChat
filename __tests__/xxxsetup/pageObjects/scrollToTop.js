import getTranscriptScrollable from '../elements/getTranscriptScrollable';

export default async function scrollToTop(driver) {
  await driver.executeScript(scrollable => {
    scrollable.scrollTop = 0;
    scrollable.dispatchEvent(new Event('scroll'));
  }, await getTranscriptScrollable(driver));
}
