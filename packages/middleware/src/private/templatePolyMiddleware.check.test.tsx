/// <reference types="jest" />

import templatePolyMiddleware from './templatePolyMiddleware';

test('should warn if middleware is not an array of function', () => {
  const warn = jest.fn();
  const template = templatePolyMiddleware('Check' as any);

  jest.spyOn(console, 'warn').mockImplementation(warn);

  template.extractMiddleware(1 as any);

  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenNthCalledWith(1, expect.stringContaining('must be an array of function'));
});

test('should throw if middleware is not a function', () => {
  const template = templatePolyMiddleware('Check' as any);

  expect(() => template.createMiddleware(1 as any)).toThrow('enhancer must be of type function');
});

test('should not warn if middleware return false', () => {
  const warn = jest.fn();
  const template = templatePolyMiddleware('Check' as any);

  jest.spyOn(console, 'warn').mockImplementation(warn);

  template.extractMiddleware([template.createMiddleware(() => false as any)]);

  expect(warn).toHaveBeenCalledTimes(0);
});

test('should not warn if middleware return function', () => {
  const warn = jest.fn();
  const template = templatePolyMiddleware('Check' as any);

  jest.spyOn(console, 'warn').mockImplementation(warn);

  template.extractMiddleware([template.createMiddleware(() => () => 1 as any)]);

  expect(warn).toHaveBeenCalledTimes(0);
});
