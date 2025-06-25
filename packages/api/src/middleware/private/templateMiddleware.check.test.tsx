import templateMiddleware from './templateMiddleware';

test('should warn if middleware did not return function', () => {
  const warn = jest.fn();
  const template = templateMiddleware('Check');

  jest.spyOn(console, 'warn').mockImplementation(warn);

  template.extractMiddleware([() => 1 as any]);

  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenNthCalledWith(1, expect.stringContaining('must return enhancer function'));
});
