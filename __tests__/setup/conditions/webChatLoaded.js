import { By, until } from 'selenium-webdriver';

export default function () {
  return until.elementLocated(By.css('[role="log"]'));
}
