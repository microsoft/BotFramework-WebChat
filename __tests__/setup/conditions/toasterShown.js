import { By, until } from 'selenium-webdriver';

export default function toasterShown() {
  return until.elementLocated(By.css('.webchat__toaster__header'));
}
