export default async function takeSynthesizeUtterance(driver) {
  return await driver.executeAsyncScript(callback => window.WebSpeechMock.mockSynthesize().then(callback, callback));
}
