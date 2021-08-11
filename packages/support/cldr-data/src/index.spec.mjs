// This file is not processed by Jest, instead, will be run thru a wrapper named "index.spec.js".

import expect from 'expect';
import fs from 'fs';

import cldrData from './index.js';

// entireSupplemental() runs without error.
expect(cldrData.entireSupplemental()).toBeTruthy();

const locales = fs.readdirSync(new URL('./../dist/main', import.meta.url));

// entireMainFor() runs for each locale without error.
locales.forEach(locale => {
  expect(cldrData.entireMainFor(locale)).toBeTruthy();
});

// all() runs without error.
expect(cldrData.all()).toBeTruthy();
