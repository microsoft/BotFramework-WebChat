import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import clickMicrophoneButton from './clickMicrophoneButton';
import hasSpeechRecognitionStartCalled from './hasSpeechRecognitionStartCalled';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';

export default async function sendMessageViaMicrophone(driver, text, { waitForSend = true } = {}) {
  await clickMicrophoneButton(driver);

  await driver.wait(hasSpeechRecognitionStartCalled(driver), timeouts.ui);

  await putSpeechRecognitionResult(driver, 'recognize', text);

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
