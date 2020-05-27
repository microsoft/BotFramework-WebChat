/**
 * @jest-environment jsdom
 */

import 'global-agent/bootstrap';

import { timeouts } from './constants.json';
import createTestHarness from './utilities/createTestHarness';
import MockAudioContext from './utilities/MockAudioContext';
import recognizeActivityAsText from './utilities/recognizeActivityAsText';
import subscribeAll from './utilities/observable/subscribeAll';
import take from './utilities/observable/take';
import waitForConnected from './utilities/waitForConnected';

jest.setTimeout(timeouts.test);

beforeEach(() => {
  global.AudioContext = MockAudioContext;``
});

test.each([true, false])('should echo back when saying "hello" and "world"', async (enableInternalHttpSupport) => {
  const { directLine, sendTextAsSpeech } = await createTestHarness(enableInternalHttpSupport);

  const connectedPromise = waitForConnected(directLine);
  const activitiesPromise = subscribeAll(take(directLine.activity$, 2));

  await connectedPromise;

  await sendTextAsSpeech('hello');
  await sendTextAsSpeech('world');

  const activities = await activitiesPromise;
  const activityUtterances = Promise.all(activities.map(activity => recognizeActivityAsText(activity)));

  await expect(activityUtterances).resolves.toMatchInlineSnapshot(`
    Array [
      "Hello.",
      "World.",
    ]
  `);
});

test.each([true, false])('should echo back "Bellevue" when saying "bellview"', async (enableInternalHttpSupport) => {
  const { directLine, sendTextAsSpeech } = await createTestHarness(enableInternalHttpSupport);

  const connectedPromise = waitForConnected(directLine);
  const activitiesPromise = subscribeAll(take(directLine.activity$, 1));

  await connectedPromise;

  await sendTextAsSpeech('bellview');

  const activities = await activitiesPromise;
  const activityUtterances = Promise.all(activities.map(activity => recognizeActivityAsText(activity)));

  await expect(activityUtterances).resolves.toMatchInlineSnapshot(`
    Array [
      "Bellevue.",
    ]
  `);
});

// 2020-05-11: Direct Line Speech protocol was updated to synthesize "text" if "speak" property is not set.
test.each([true, false])('should synthesis if "speak" is empty', async (enableInternalHttpSupport) => {
  const { directLine, sendTextAsSpeech } = await createTestHarness(enableInternalHttpSupport);

  const connectedPromise = waitForConnected(directLine);
  const activitiesPromise = subscribeAll(take(directLine.activity$, 1));

  await connectedPromise;

  // "Don't speak XXX" command will not send "speak" property on respond.
  await sendTextAsSpeech("Don't speak anything.");

  const activities = await activitiesPromise;
  const activityUtterances = await Promise.all(activities.map(activity => recognizeActivityAsText(activity)));

  expect(activityUtterances).toEqual([`Don't speak anything.`]);
});
