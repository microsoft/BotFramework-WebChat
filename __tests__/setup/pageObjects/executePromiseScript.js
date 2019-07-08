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
