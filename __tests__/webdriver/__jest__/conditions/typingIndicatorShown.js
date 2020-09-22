import { By, until } from 'selenium-webdriver';

export default function typingIndicatorShown() {
  return until.elementLocated(By.css('.webchat__typingIndicator'));
}
