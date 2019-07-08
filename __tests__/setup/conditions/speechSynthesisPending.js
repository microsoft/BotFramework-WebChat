import { Condition } from 'selenium-webdriver';

import isPendingSpeechSynthesis from '../pageObjects/isPendingSpeechSynthesis';

export default function speechRecognitionStarted() {
  return new Condition('Speech synthesis is pending', async driver => await isPendingSpeechSynthesis(driver));
}
