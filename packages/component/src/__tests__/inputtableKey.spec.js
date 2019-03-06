import inputtableKey from '../Utils/TypeFocusSink/inputtableKey';

describe('inputtableKey', () => {
  it('Should return the inputtable key', () => {
    expect(inputtableKey('Add')).toBe('+');
    expect(inputtableKey('Decimal')).toBe('.');
    expect(inputtableKey('Divide')).toBe('/');
    expect(inputtableKey('Multiply')).toBe('*');
    expect(inputtableKey('Subtract')).toBe('-');
  });
});
