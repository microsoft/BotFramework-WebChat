import { By, until } from 'selenium-webdriver';

export default function scrollToBottomButtonVisible() {
  return until.elementLocated(By.css(`[role="log"]:not(.webchat__toaster) > button:last-child`));
}
