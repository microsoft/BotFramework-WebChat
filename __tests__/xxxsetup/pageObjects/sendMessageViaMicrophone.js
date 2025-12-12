import { timeouts } from '../../constants.json';

import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import clickMicrophoneButton from './clickMicrophoneButton';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import speechRecognitionStartCalled from '../conditions/speechRecognitionStartCalled';

export default async function sendMessageViaMicrophone(driver, text, { waitForSend = true } = {}) {
  await clickMicrophoneButton(driver);

  await driver.wait(speechRecognitionStartCalled(), timeouts.ui);

  await putSpeechRecognitionResult(driver, 'recognize', text);

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
