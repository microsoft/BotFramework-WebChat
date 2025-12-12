import { By, until } from 'selenium-webdriver';

export default function toasterExpanded() {
  return until.elementLocated(By.css('.webchat__toaster--expanded'));
}
