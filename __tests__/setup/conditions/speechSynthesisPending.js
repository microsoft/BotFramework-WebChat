import { Condition } from 'selenium-webdriver';

import isPendingSpeechSynthesis from '../pageObjects/isPendingSpeechSynthesis';

export default function speechRecognitionStarted() {
  return new Condition('Speech synthesis is pending', async driver => await isPendingSpeechSynthesis(driver));
}

function negate() {
  const condition = speechRecognitionStarted();

  return new Condition('Speech synthesis is not pending', async driver => !(await condition.fn(driver)));
}

export { negate };
