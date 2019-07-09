export default async function hasPendingSpeechSynthesisUtterance(driver) {
  return await driver.executeScript(() => window.WebSpeechMock.hasPendingUtterance());
}
