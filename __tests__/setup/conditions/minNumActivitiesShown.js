import { By, until } from 'selenium-webdriver';

export default function minNumActivitiesShown(numActivities) {
  return until.elementLocated(By.css(`[role="listitem"]:nth-child(${numActivities})`));
}
