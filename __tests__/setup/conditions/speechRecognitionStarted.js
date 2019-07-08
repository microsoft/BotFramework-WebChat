import { Condition } from 'selenium-webdriver';

export default function speechRecognitionStarted() {
  return new Condition(
    'Speech recognition to start',
    async driver => await driver.executeScript(() => window.SpeechRecognitionMock.hasConsumer())
  );
}
