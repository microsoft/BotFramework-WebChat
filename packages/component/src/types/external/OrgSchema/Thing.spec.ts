import { isThing, isThingOf } from './Thing';

describe('isThing', () => {
  describe.each([['Thing'], ['Person']])('of %s', type => {
    test('should return true with @context, @type, and type', () =>
      expect(isThing({ '@context': 'https://schema.org', '@type': type, type: `https://schema.org/${type}` })).toBe(
        true
      ));
  });

  test('should return false with conflicting type', () =>
    expect(isThing({ '@context': 'https://schema.org', '@type': 'Action', type: `https://schema.org/Person` })).toBe(
      false
    ));

  test('should return false when conflict with unknown @context', () =>
    expect(isThing({ '@context': 'https://abc.com', type: `https://schema.org/Person` } as any)).toBe(false));

  test('should return false when conflict without @context', () =>
    expect(isThing({ '@type': 'Action', type: `https://schema.org/Person` } as any)).toBe(false));

  test('should return false for empty array', () => expect(isThing([] as any)).toBe(false));
  test('should return false for false', () => expect(isThing(false as any)).toBe(false));
  test('should return false for null', () => expect(isThing(null as any)).toBe(false));
  test('should return false for number', () => expect(isThing(0 as any)).toBe(false));
  test('should return false for plain object', () => expect(isThing({} as any)).toBe(false));
  test('should return false for string', () => expect(isThing('Hello, World!' as any)).toBe(false));
  test('should return false for undefined', () => expect(isThing(undefined as any)).toBe(false));
});

describe('isThingOf', () => {
  test('should return true for Person with @context, @type, and type', () =>
    expect(
      isThingOf({ '@context': 'https://schema.org', '@type': 'Person', type: 'https://schema.org/Person' }, 'Person')
    ).toBe(true));

  test('should return false for Person with @context and @type of Action but type of Person', () =>
    expect(
      isThingOf({ '@context': 'https://schema.org', '@type': 'Action', type: 'https://schema.org/Person' }, 'Person')
    ).toBe(false));

  test('should return false for Person with @context and @type of Person but type of Action', () =>
    expect(
      isThingOf({ '@context': 'https://schema.org', '@type': 'Person', type: 'https://schema.org/Action' }, 'Person')
    ).toBe(false));

  test('should return false for Person with @context, @type, and type of Action', () =>
    expect(
      isThingOf({ '@context': 'https://schema.org', '@type': 'Action', type: 'https://schema.org/Action' }, 'Person')
    ).toBe(false));

  test('should return false for empty array', () => expect(isThing([] as any)).toBe(false));
  test('should return false for false', () => expect(isThing(false as any)).toBe(false));
  test('should return false for null', () => expect(isThing(null as any)).toBe(false));
  test('should return false for number', () => expect(isThing(0 as any)).toBe(false));
  test('should return false for plain object', () => expect(isThing({} as any)).toBe(false));
  test('should return false for string', () => expect(isThing('Hello, World!' as any)).toBe(false));
  test('should return false for undefined', () => expect(isThing(undefined as any)).toBe(false));
});
