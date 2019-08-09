import getSendBoxTextBox from './elements/getSendBoxTextBox';

export default async function setSendBoxText(driver, ...args) {
  const textBox = await getSendBoxTextBox(driver);

  await textBox.sendKeys(...args);
}
