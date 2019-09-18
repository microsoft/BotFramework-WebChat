import { Condition } from 'selenium-webdriver';

import getScrollToBottomButton from '../elements/getScrollToBottomButton';

export default function scrollToBottomButtonVisible() {
  return new Condition('for scroll to bottom become visible', driver =>
    driver.executeScript(() => !!getScrollToBottomButton(driver))
  );
}
