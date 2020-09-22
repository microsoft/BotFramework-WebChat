import executePromiseScript from './executePromiseScript';

const NULL_FN = arg => arg;

export default async function runHook(driver, name, args = [], selector = NULL_FN) {
  return await executePromiseScript(
    driver,
    (name, args, selectorString) => {
      const selector = eval(`(${selectorString})`);

      args.unshift(name);

      return window.WebChatTest.runHook.apply(null, args).then(selector);
    },
    name,
    args,
    selector.toString()
  );
}
