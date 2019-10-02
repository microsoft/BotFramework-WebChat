import deleteKey from '../utils/deleteKey';

describe('deleteKey', () => {
  it('should return a falsy map', () => {
    expect(deleteKey(null, 'someKey')).toBe(null);
    expect(deleteKey(false, 'someKey')).toBe(false);
  });

  it('it should delete a key from an object', () => {
    const someMap = { key: 'someValue' };
    const map = deleteKey(someMap, 'key');

    expect(map.key).toBeUndefined();
  });
});
