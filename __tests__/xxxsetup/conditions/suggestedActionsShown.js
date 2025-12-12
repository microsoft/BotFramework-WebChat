import { By, until } from 'selenium-webdriver';

export default function suggestedActionsShown() {
  return until.elementLocated(By.css('[role="form"] > :not(.main) button'));
}
