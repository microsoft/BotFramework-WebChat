jest.mock('./aries', () => jest.fn());
jest.mock('./scorpio', () => jest.fn());
jest.mock('./version3', () => jest.fn());
jest.mock('./version4', () => jest.fn());

const setup = require('./index')['default'];

test('Setup Aries', () => {
  setup({ versionFamily: 'aries' });

  expect(require('./aries')).toHaveBeenCalledTimes(1);
});

test('Setup Scorpio', () => {
  setup({ versionFamily: 'scorpio' });

  expect(require('./scorpio')).toHaveBeenCalledTimes(1);
});

test('Setup version 3', () => {
  setup({ versionFamily: '3' });

  expect(require('./version3')).toHaveBeenCalledTimes(1);
});

test('Setup default version', () => {
  setup();

  expect(require('./version4')).toHaveBeenCalledTimes(1);
});
