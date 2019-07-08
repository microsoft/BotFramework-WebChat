export default async function isSynthesizingSpeech(driver) {
  return await driver.executeScript(() => !!window.WebSpeechMock.peekSynthesize());
}
