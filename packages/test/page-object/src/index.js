import 'core-js/stable';

import { EventIterator } from 'event-iterator';
import classNames from 'classnames';
import createDeferred from 'p-defer';
import lolex from 'lolex';
import Observable from 'core-js/features/observable';
import updateIn from 'simple-update-in';

import * as pageConditions from './globals/pageConditions/index';
import * as pageElements from './globals/pageElements/index';
import * as pageObjects from './globals/pageObjects/index';
import * as testHelpers from './globals/testHelpers/index';

window.classNames = classNames;
window.createDeferred = createDeferred;
window.EventIterator = EventIterator;
window.lolex = lolex;
window.Observable = Observable;
window.pageConditions = pageConditions;
window.pageElements = pageElements;
window.pageObjects = pageObjects;
window.testHelpers = testHelpers;
window.updateIn = updateIn;
