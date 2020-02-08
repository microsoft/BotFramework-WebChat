import { By, until } from 'selenium-webdriver';

export default function toasterExpandable() {
  return until.elementLocated(By.css('.webchat__toaster--expandable'));
}
