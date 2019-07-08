export default async function peekSynthesizeUtterance(driver) {
  return await driver.executeScript(() => window.WebSpeechMock.peekSynthesize());
}
