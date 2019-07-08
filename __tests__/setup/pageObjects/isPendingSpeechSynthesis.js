export default async function isPendingSpeechSynthesis(driver) {
  return await driver.executeScript(() => !!window.WebSpeechMock.peekSynthesize());
}
