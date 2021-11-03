import isForbiddenPropertyName from './isForbiddenPropertyName';

test('should forbid "__proto__"', () => expect(isForbiddenPropertyName('__proto__')).toBeTruthy());
test('should forbid "constructor"', () => expect(isForbiddenPropertyName('constructor')).toBeTruthy());
test('should forbid "prototype"', () => expect(isForbiddenPropertyName('prototype')).toBeTruthy());
test('should not forbid "abc"', () => expect(isForbiddenPropertyName('abc')).toBeFalsy());
