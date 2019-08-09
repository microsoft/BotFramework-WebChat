// Checks if Web Chat has called "speechRecognition.start()" and pending for a series of speech events.

export default async function hasSpeechRecognitionStartCalled(driver) {
  return await driver.executeScript(() => window.WebSpeechMock.hasSpeechRecognitionStartCalled());
}
