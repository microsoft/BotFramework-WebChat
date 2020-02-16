import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('should return string for "yue"', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('TEXT_INPUT_SPEAK_BUTTON_ALT'));

  expect(actual).toMatchInlineSnapshot(`"講嘢"`);
});

test('should return string for default language', async () => {
  const { pageObjects } = await setupWebDriver();

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('TEXT_INPUT_SPEAK_BUTTON_ALT'));

  expect(actual).toMatchInlineSnapshot(`"Speak"`);
});

test('should return empty string for non-existent ID', async () => {
  const { pageObjects } = await setupWebDriver();

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('NON_EXISTENT'));

  expect(actual).toMatchInlineSnapshot(`""`);
});

test('should return overrode string for non-existent ID', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue',
      overrideLocalizedStrings: {
        SOMETHING_NEW: 'Something new'
      }
    }
  });

  const actual = await pageObjects.runHook('useLocalizer', [], localizer => localizer('SOMETHING_NEW'));

  expect(actual).toMatchInlineSnapshot(`"Something new"`);
});

test('should throw if "id" is not string', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useLocalizer', [], localize => localize({ abc: 123 }))).rejects.toThrow(
    'useLocalizer: "id" must be a string.'
  );
});

test('plural rules for "yue"', async () => {
  // "two", "few", "many" are not set in "yue".
  // Make sure it use the "yue" version of "other", instead of "en" version of "other".

  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'yue'
    }
  });

  const actual = await pageObjects.runHook('useLocalizer', [{ plural: true }], localize =>
    localize(
      {
        two: 'TOAST_ACCORDION_TWO',
        few: 'TOAST_ACCORDION_FEW',
        many: 'TOAST_ACCORDION_MANY',
        other: 'TOAST_ACCORDION_OTHER'
      },
      2
    )
  );

  expect(actual).toMatchInlineSnapshot(`"2 項通知：襟呢度睇詳情"`);
});

describe('plural rules', () => {
  let pageObjects;

  beforeEach(async () => {
    pageObjects = (
      await setupWebDriver({
        props: {
          overrideLocalizedStrings: {
            ZERO: 'Zero: $1',
            ONE: 'One: $1',
            TWO: 'Two: $1',
            FEW: 'Few: $1',
            MANY: 'Many: $1',
            OTHER: 'Other: $1'
          }
        }
      })
    ).pageObjects;
  });

  test('should return plural string of one', async () => {
    const actual = await pageObjects.runHook('useLocalizer', [{ plural: true }], localizer =>
      localizer(
        {
          zero: 'ZERO',
          one: 'ONE',
          two: 'TWO',
          few: 'FEW',
          many: 'MANY',
          other: 'OTHER'
        },
        1
      )
    );

    expect(actual).toMatchInlineSnapshot(`"One: 1"`);
  });

  test('should return plural string of other', async () => {
    const actual = await pageObjects.runHook('useLocalizer', [{ plural: true }], localizer =>
      localizer(
        {
          zero: 'ZERO',
          one: 'ONE',
          two: 'TWO',
          few: 'FEW',
          many: 'MANY',
          other: 'OTHER'
        },
        2
      )
    );

    expect(actual).toMatchInlineSnapshot(`"Other: 2"`);
  });

  test('should return plural string which fallback to other', async () => {
    const actual = await pageObjects.runHook('useLocalizer', [{ plural: true }], localizer =>
      localizer(
        {
          other: 'OTHER'
        },
        1
      )
    );

    expect(actual).toMatchInlineSnapshot(`"Other: 1"`);
  });

  test('should throw with "id" of string', async () => {
    await expect(
      pageObjects.runHook('useLocalizer', [{ plural: true }], localizer => localizer('THIS_SHOULD_BE_MAP_INSTEAD', 1))
    ).rejects.toThrow('useLocalizer: Plural string must pass "id" as a map instead of string.');
  });

  test('should throw with "id.one" of number', async () => {
    await expect(
      pageObjects.runHook('useLocalizer', [{ plural: true }], localizer => localizer({ one: 123, other: 'OTHER' }, 1))
    ).rejects.toThrow('useLocalizer: Plural string must have "id.one" of string or undefined.');
  });

  test('should throw with "id.other" not defined', async () => {
    await expect(
      pageObjects.runHook('useLocalizer', [{ plural: true }], localizer => localizer({ one: 123 }, 1))
    ).rejects.toThrow('useLocalizer: Plural string must have "id.other" of string.');
  });

  test('should throw with "id.unknown"', async () => {
    await expect(
      pageObjects.runHook('useLocalizer', [{ plural: true }], localizer =>
        localizer({ other: 'OTHER', unknown: 'UNKNOWN' }, 1)
      )
    ).rejects.toThrow(
      'useLocalizer: Plural string "id" must be either "zero", "one", "two", "few", "many", "other". But not "unknown".'
    );
  });

  test('should throw with first argument of string', async () => {
    await expect(
      pageObjects.runHook('useLocalizer', [{ plural: true }], localizer => localizer({ other: 'OTHER' }, 'abc'))
    ).rejects.toThrow('useLocalizer: Plural string must have first argument as a number.');
  });
});
