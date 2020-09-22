export default async function putSpeechRecognitionResult(driver, ...args) {
  await driver.executeScript((...args) => window.WebSpeechMock.mockRecognize(...args), ...args);
}
