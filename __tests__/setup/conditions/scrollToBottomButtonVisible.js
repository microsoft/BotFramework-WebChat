import { By, until } from 'selenium-webdriver';

export default function scrollToBottomButtonVisible() {
  return until.elementLocated(By.css(`.webchat__scroll-to-end-button`));
}
