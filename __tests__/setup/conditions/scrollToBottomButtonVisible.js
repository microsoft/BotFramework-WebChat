import { By, until } from 'selenium-webdriver';

export default function scrollToBottomButtonVisible() {
  return until.elementLocated(By.css(`button.webchat__scrollToEndButton`));
}
