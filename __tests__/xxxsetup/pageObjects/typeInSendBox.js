import getSendBoxTextBox from '../elements/getSendBoxTextBox';

export default async function typeInSendBox(driver, ...args) {
  const textBox = await getSendBoxTextBox(driver);

  await textBox.sendKeys(...args);
}
