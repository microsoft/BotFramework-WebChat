// executeAsyncScript is not running a Promise function and is not able to deal with errors.
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#executeAsyncScript
// This function will use executeAsyncScript to run a Promise function in an async fashion.

export default async function executePromiseScript(driver, fn, ...args) {
  const { error, result } = await driver.executeAsyncScript(
    (fn, args, callback) => {
      eval(`(${fn})`)
        .apply(null, args)
        .then(result => callback({ result }), error => callback({ error }));
    },
    fn + '',
    args
  );

  if (error) {
    const err = new Error(error.message);

    err.stack = error.stack;

    throw err;
  } else {
    return result;
  }
}
