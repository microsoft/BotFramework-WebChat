import { Condition } from 'selenium-webdriver';

import isRecognizingSpeech from '../pageObjects/isRecognizingSpeech';

export default function speechRecognitionStarted() {
  return new Condition('Speech recognition to start', async driver => await isRecognizingSpeech(driver));
}
