import onErrorResumeNext from './onErrorResumeNext';

test('should return value if no error', () =>
  expect(onErrorResumeNext<string>(() => 'Hello, World!')).toBe('Hello, World!'));

test('should return undefined on error', () =>
  expect(
    onErrorResumeNext<string>(() => {
      throw new Error('Artificial.');
    })
  ).toBeUndefined());

test('should return default value on error', () =>
  expect(
    onErrorResumeNext<string, boolean>(() => {
      throw new Error('Artificial.');
    }, false)
  ).toBe(false));
