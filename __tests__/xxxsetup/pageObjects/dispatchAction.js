export default async function dispatchAction(driver, action) {
  if (!action) {
    throw new Error('"action" cannot be empty.');
  } else if (!action.type || typeof action.type !== 'string') {
    throw new Error('"action.type" must be a string.');
  }

  return await driver.executeScript(action => {
    const { store } = window.WebChatTest || {};

    if (store) {
      return store.dispatch(action);
    } else {
      throw new Error('Web Chat is not loaded, cannot dispatch action.');
    }
  }, action);
}
