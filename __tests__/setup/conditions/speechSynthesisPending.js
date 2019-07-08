import { Condition } from 'selenium-webdriver';

import isSynthesizingSpeech from '../pageObjects/isSynthesizingSpeech';

export default function speechRecognitionStarted() {
  return new Condition('Speech synthesis is pending', async driver => await isSynthesizingSpeech(driver));
}
