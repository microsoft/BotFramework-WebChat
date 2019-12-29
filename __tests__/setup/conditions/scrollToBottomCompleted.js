import { Condition } from 'selenium-webdriver';

export default function scrollToBottomCompleted() {
  return new Condition('for UI to scroll to bottom', async driver => {
    async function completed() {
      return await driver.executeScript(() => {
        const scrollable = document.querySelector('[role="log"] > *');

        return scrollable && scrollable.offsetHeight + scrollable.scrollTop === scrollable.scrollHeight;
      });
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
