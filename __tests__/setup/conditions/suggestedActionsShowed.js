import { By, until } from 'selenium-webdriver';

export default function suggestedActionsShowed() {
  return until.elementLocated(By.css('[role="form"] ul'));
}
