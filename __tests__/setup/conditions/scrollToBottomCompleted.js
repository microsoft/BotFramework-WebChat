import { Condition } from 'selenium-webdriver';

export default function scrollToBottomCompleted() {
  return new Condition('for UI to scroll to bottom', driver =>
    driver.executeScript(() => {
      const scrollable = document.querySelector('[role="log"] > *');

      return scrollable && scrollable.offsetHeight + scrollable.scrollTop === scrollable.scrollHeight;
    })
  );
}
