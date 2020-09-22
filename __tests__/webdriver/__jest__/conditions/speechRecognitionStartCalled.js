import { Condition } from 'selenium-webdriver';

// Checks if Web Chat has called "speechRecognition.start()" and pending for a series of speech events.

export default function speechRecognitionStartCalled() {
  return new Condition('SpeechRecognition.start to be called', driver =>
    driver.executeScript(() => window.WebSpeechMock.speechRecognitionStartCalled())
  );
}
