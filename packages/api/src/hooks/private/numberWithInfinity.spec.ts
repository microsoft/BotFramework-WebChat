import numberWithInfinity from './numberWithInfinity';

test('passing "Infinity" should return Infinity', () => expect(numberWithInfinity('Infinity')).toBe(Infinity));
test('passing "-Infinity" should return -Infinity', () => expect(numberWithInfinity('-Infinity')).toBe(-Infinity));
test('passing 0 should return 0', () => expect(numberWithInfinity(0)).toBe(0));
test('passing -0 should return -0', () => expect(numberWithInfinity(-0)).toBe(-0));
test('passing 1 should return 1', () => expect(numberWithInfinity(1)).toBe(1));
test('passing "1" should return undefined', () => expect(numberWithInfinity('1' as any)).toBeUndefined());
test('passing "ABC" should return undefined', () => expect(numberWithInfinity('ABC' as any)).toBeUndefined());
