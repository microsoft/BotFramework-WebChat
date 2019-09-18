import { By, Condition } from 'selenium-webdriver';

import hasElement from './hasElement';

export default function scrollToBottomButtonVisible() {
  return new Condition('for scroll to bottom become visible', driver =>
    hasElement(By.css('[role="log"] > button:last-child')).fn(driver)
  );
}
