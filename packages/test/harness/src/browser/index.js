// Set APIs such as .union and .difference are only available
// starting from Chrome 122 while we need to support Chrome 110.
import 'core-js/features/set/index.js';

import checkAccessibility from './globals/checkAccessibility';
import expect from './globals/expect';
import host from './globals/host';
import imageAsLog from './globals/imageAsLog';
import run from './globals/run';
import webDriverPort from './globals/webDriverPort';

checkAccessibility();
expect();
host();
imageAsLog();
run();
webDriverPort();
