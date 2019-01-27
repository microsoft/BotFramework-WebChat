import { By, until } from 'selenium-webdriver';

export default function (numActivities) {
  return until.elementLocated(By.css(`[role="listitem"]:nth-child(${ numActivities })`));
}
