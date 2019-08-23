import { By } from 'selenium-webdriver';

export default async function getNotificationText(driver) {
  const notificationTextAriaLabel = driver.findElement(By.css('[role="status"] > [aria-label]'));

  if (notificationTextAriaLabel) {
    return await notificationTextAriaLabel.getAttribute('innerText');
  }
}
