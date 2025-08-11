import 'core-js/stable';

import { EventIterator } from 'event-iterator';
import classNames from 'classnames';
import lolex from 'lolex';
import Observable from 'core-js/features/observable';
import updateIn from 'simple-update-in';

import * as pageConditions from './globals/pageConditions/index';
import * as pageElements from './globals/pageElements/index';
import * as pageObjects from './globals/pageObjects/index';
import * as testHelpers from './globals/testHelpers/index';
import renderWebChat from './globals/renderWebChat';
import withResolvers from './utils/withResolvers';

window.classNames = classNames;
window.createDeferred = () => withResolvers();
window.EventIterator = EventIterator;
window.lolex = lolex;
window.Observable = Observable;
window.pageConditions = pageConditions;
window.pageElements = pageElements;
window.pageObjects = pageObjects;
window.renderWebChat = renderWebChat;
window.testHelpers = testHelpers;
window.updateIn = updateIn;
