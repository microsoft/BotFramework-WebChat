import getMicrophoneButton from '../elements/getMicrophoneButton';

export default async function clickMicrophoneButton(driver) {
  const microphoneButton = await getMicrophoneButton(driver);

  await microphoneButton.click();
}
