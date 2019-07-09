export default async function isRecognizingSpeech(driver) {
  return await driver.executeScript(() => window.WebSpeechMock.isRecognizing());
}
