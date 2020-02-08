import { Condition } from 'selenium-webdriver';

import getTranscriptScrollable from '../elements/getTranscriptScrollable';

export default function scrollToBottomCompleted() {
  return new Condition('for UI to scroll to bottom', async driver => {
    async function completed() {
      const scrollable = await getTranscriptScrollable(driver);

      return (
        scrollable &&
        (await driver.executeScript(
          scrollable => scrollable.offsetHeight + scrollable.scrollTop === scrollable.scrollHeight,
          scrollable
        ))
      );
    }

    // Browser may keep rendering content. Wait until 5 consecutive completion checks are all truthy.
    for (let count = 0; count < 5; count++) {
      if (!(await completed())) {
        return false;
      }
    }

    return true;
  });
}
