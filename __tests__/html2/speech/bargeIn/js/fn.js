export default function fn(
  /** @type {Function | undefined} */
  impl
) {
  const fn = (...args) => {
    fn.mock.calls.push(args);

    return impl?.(...args);
  };

  fn._isMockFunction = true;
  fn.getMockName = () => 'mock';
  fn.mock = { calls: [] };

  return fn;
}
