export default async function getStore(driver) {
  return await driver.executeScript(() => {
    const { store } = window.WebChatTest || {};

    if (store) {
      return store.getState();
    } else {
      throw new Error('Web Chat is not loaded, cannot dispatch action.');
    }
  });
}
