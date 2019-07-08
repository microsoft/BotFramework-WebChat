export default async function takeSynthesizeUtterance(driver, ...args) {
  return await driver.executeAsyncScript(function(...args) {
    const callback = args.pop();

    window.WebSpeechMock.mockSynthesize(...args).then(callback, callback);
  }, ...args);
}
