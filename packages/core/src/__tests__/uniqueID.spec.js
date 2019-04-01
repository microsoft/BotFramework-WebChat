import uniqueId from '../utils/uniqueID';

describe('uniqueID', () => {
  it('should generate unique ids', () => {
    expect(uniqueId()).not.toBe(uniqueId());
  });
});
