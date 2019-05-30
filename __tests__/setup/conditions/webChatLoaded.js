import { By, until } from 'selenium-webdriver';

export default function webChatLoaded() {
  return until.elementLocated(By.css('[role="log"]'));
}
