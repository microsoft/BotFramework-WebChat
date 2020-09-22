import getSendBoxTextBox from '../elements/getSendBoxTextBox';

export default async function getSendBoxText(driver) {
  const textBox = await getSendBoxTextBox(driver);

  return await textBox.getAttribute('value');
}
