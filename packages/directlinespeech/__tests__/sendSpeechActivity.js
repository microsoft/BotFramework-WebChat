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
  global.AudioContext = MockAudioContext;
});

// TODO: [P2] #4053 Temporarily disable "internal HTTP" test until service recovered.
// describe.each([['without internal HTTP support'], ['with internal HTTP support', { enableInternalHTTPSupport: true }]])(
describe.each([['without internal HTTP support']])('%s', (_, testHarnessOptions) => {
  test.nightly('should echo back when saying "hello" and "world"', async () => {
    if (!process.env.SPEECH_SERVICES_SUBSCRIPTION_KEY) {
      throw new Error('"SPEECH_SERVICES_SUBSCRIPTION_KEY" environment variable must be set.');
    }

    const { directLine, fetchCredentials, sendTextAsSpeech } = await createTestHarness(testHarnessOptions);

    const connectedPromise = waitForConnected(directLine);
    const activitiesPromise = subscribeAll(take(directLine.activity$, 2));

    await connectedPromise;

    await sendTextAsSpeech('hello');
    await sendTextAsSpeech('world');

    const activities = await activitiesPromise;
    const activityUtterances = Promise.all(
      activities.map(activity => recognizeActivityAsText(activity, { fetchCredentials }))
    );

    await expect(activityUtterances).resolves.toEqual(['Hello.', 'World.']);
  });

  test.nightly('should echo back "Bellevue" when saying "bellview"', async () => {
    if (!process.env.SPEECH_SERVICES_SUBSCRIPTION_KEY) {
      throw new Error('"SPEECH_SERVICES_SUBSCRIPTION_KEY" environment variable must be set.');
    }

    const { directLine, fetchCredentials, sendTextAsSpeech } = await createTestHarness(testHarnessOptions);

    const connectedPromise = waitForConnected(directLine);
    const activitiesPromise = subscribeAll(take(directLine.activity$, 1));

    await connectedPromise;

    await sendTextAsSpeech('bellview');

    const activities = await activitiesPromise;
    const activityUtterances = Promise.all(
      activities.map(activity => recognizeActivityAsText(activity, { fetchCredentials }))
    );

    await expect(activityUtterances).resolves.toEqual(['Bellevue.']);
  });

  // TODO: Re-enable this test for "enableInternalHttpSupport = true" once DLS bug fix is lit up in production.
  // 2020-05-11: Direct Line Speech protocol was updated to synthesize "text" if "speak" property is not set.
  test.nightly('should synthesis if "speak" is empty', async () => {
    if (!process.env.SPEECH_SERVICES_SUBSCRIPTION_KEY) {
      throw new Error('"SPEECH_SERVICES_SUBSCRIPTION_KEY" environment variable must be set.');
    }

    const { directLine, fetchCredentials, sendTextAsSpeech } = await createTestHarness(testHarnessOptions);

    const connectedPromise = waitForConnected(directLine);
    const activitiesPromise = subscribeAll(take(directLine.activity$, 1));

    await connectedPromise;

    // "Don't speak XXX" command will not send "speak" property on respond.
    await sendTextAsSpeech("Don't speak anything.");

    const activities = await activitiesPromise;
    const activityUtterances = await Promise.all(
      activities.map(activity => recognizeActivityAsText(activity, { fetchCredentials }))
    );

    // Despite it does not have "speak" property, Direct Line Speech protocol will fallback to "text" property for synthesize.
    expect(activityUtterances).toEqual([`Don't speak anything.`]);
  });
});
