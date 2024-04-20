import lastOf from './lastOf';

test('should return last element', () => {
  expect(lastOf(Object.freeze(['1', '2', '3']))).toBe('3');
});

test('when passed empty array should return undefined', () => {
  expect(lastOf([])).toBeUndefined();
});

test('when passed undefined should return undefined', () => {
  expect(lastOf(undefined)).toBeUndefined();
});

test('when passed null should return undefined', () => {
  expect(lastOf(null as any)).toBeUndefined();
});
