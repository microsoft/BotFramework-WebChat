export default async function hasSpeechRecognitionStartCalled(driver) {
  return await driver.executeScript(() => window.WebSpeechMock.hasSpeechRecognitionStartCalled());
}
