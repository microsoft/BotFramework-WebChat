import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import getMicrophoneButton from './getMicrophoneButton';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import speechRecognitionStarted from '../conditions/speechRecognitionStarted';

export default async function sendMessageViaMicrophone(driver, text, { waitForSend = true } = {}) {
  const microphoneButton = await getMicrophoneButton(driver);

  await microphoneButton.click();

  await driver.wait(speechRecognitionStarted(), timeouts.ui);
  await putSpeechRecognitionResult(driver, 'recognize', text);

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
