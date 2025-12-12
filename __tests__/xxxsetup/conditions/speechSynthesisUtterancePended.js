import { Condition } from 'selenium-webdriver';

export default function speechSynthesisUtterancePended() {
  return new Condition('Speech synthesis utterance to be pended to synthesize', driver =>
    driver.executeScript(() => window.WebSpeechMock.speechSynthesisUtterancePended())
  );
}
