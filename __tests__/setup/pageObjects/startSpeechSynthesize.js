export default async function startSpeechSynthesize(driver) {
  return await driver.executeScript(() => window.WebSpeechMock.mockStartSynthesize());
}
