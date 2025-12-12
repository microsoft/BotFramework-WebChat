import { By } from 'selenium-webdriver';

export default async function getUploadButton(driver) {
  return await driver.findElement(By.css('input[type="file"]'));
}
