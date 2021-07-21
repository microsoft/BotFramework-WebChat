const fs = require('fs');
const path = require('path');

test('should load CLDR data', () => {
  const cldrData = require('.');

  // entireSupplemental() runs without error.
  expect(cldrData.entireSupplemental()).toBeTruthy();

  const locales = fs.readdirSync(path.join(__dirname, '../dist/main'));

  // entireMainFor() runs for each locale without error.
  locales.forEach(locale => {
    expect(cldrData.entireMainFor(locale)).toBeTruthy();
  });

  // all() runs without error.
  expect(cldrData.all()).toBeTruthy();
});
