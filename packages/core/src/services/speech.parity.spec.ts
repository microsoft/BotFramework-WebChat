/**
 * @jest-environment @happy-dom/jest-environment
 */
// The speech service against Redux mode: every speech script runs on both, and after every step, the dictate state and
// interims, the speech of the incoming activities, the activities (marked to be spoken or spoken), every change and
// their order across values, the calls to Direct Line, the suggested actions (and whether their origin was marked), the
// warnings and errors, and the timers set must be the same.
import createReduxDriver from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import runParityScript from '../__tests__/parity/runParityScript';
import speechScripts from '../__tests__/parity/speechScripts';

describe.each(Object.keys(speechScripts))('%s', name => {
  test('the services do what Redux mode does', async () => {
    // eslint-disable-next-line security/detect-object-injection
    const script = speechScripts[name];
    const redux = await runParityScript(createReduxDriver, script, { speech: true });
    const services = await runParityScript(createServicesDriver, script, { speech: true });

    expect(services).toStrictEqual(redux);
  });
});
