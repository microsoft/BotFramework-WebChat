import PrecompiledGlobalize from '../../lib/external/PrecompiledGlobalize';

describe.each([
  ['ar-EG'],
  ['ar-SA'],
  ['bg'],
  ['ca'],
  ['cs'],
  ['da'],
  ['de'],
  ['el'],
  ['en'],
  ['es'],
  ['et'],
  ['eu'],
  ['fi'],
  ['fr'],
  ['gl'],
  ['he'],
  ['hi'],
  ['hr'],
  ['hu'],
  ['id'],
  ['it'],
  ['ja'],
  ['kk'],
  ['ko'],
  ['lt'],
  ['lv'],
  ['ms'],
  ['nb'],
  ['nl'],
  ['pl'],
  ['pt'],
  ['pt-PT'],
  ['ro'],
  ['ru'],
  ['sk'],
  ['sl'],
  ['sr-Cyrl'],
  ['sr-Latn'],
  ['sv'],
  ['th'],
  ['tr'],
  ['uk'],
  ['vi'],
  ['yue'],
  ['zh-Hans'],
  ['zh-Hans-SG'],
  ['zh-Hant'],
  ['zh-Hant-HK'],
  ['zh-Hant-MO']
])('use globalize with locale "%s"', locale => {
  const globalize = new PrecompiledGlobalize(locale);

  test('should format date', () =>
    // eslint-disable-next-line no-restricted-globals
    expect(globalize.dateFormatter({ skeleton: 'MMMMdhm' })(new Date('2023-09-22T12:34:56.789Z'))).toMatchSnapshot());

  // eslint-disable-next-line no-magic-numbers
  test('should format plural', () => expect(globalize.pluralGenerator()(12345)).toMatchSnapshot());

  test('should format positive relative time in hour', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.relativeTimeFormatter('hour')(10)).toMatchSnapshot());

  test('should format negative relative time in hour', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.relativeTimeFormatter('hour')(-10)).toMatchSnapshot());

  test('should format positive relative time in minute', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.relativeTimeFormatter('minute')(10)).toMatchSnapshot());

  test('should format negative relative time in minute', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.relativeTimeFormatter('minute')(-10)).toMatchSnapshot());

  test('should format number in byte with long format', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.unitFormatter('byte', { form: 'long' })(10)).toMatchSnapshot());

  test('should format number in kilobyte with short format', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.unitFormatter('kilobyte', { form: 'short' })(10)).toMatchSnapshot());

  test('should format number in megabyte with short format', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.unitFormatter('megabyte', { form: 'short' })(10)).toMatchSnapshot());

  test('should format number in gigabyte with short format', () =>
    // eslint-disable-next-line no-magic-numbers
    expect(globalize.unitFormatter('gigabyte', { form: 'short' })(10)).toMatchSnapshot());
});
