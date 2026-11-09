/**
 * @jest-environment @happy-dom/jest-environment
 */
// The incoming service against the sagas: every script of the incoming parity spec runs on both, and after every step,
// the calls to Direct Line, the activities, the suggested actions set, connectivity status, notifications, the warnings
// and errors, and the timers set must be the same.
import createReduxDriver from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import incomingScripts from '../__tests__/parity/incomingScripts';
import runParityScript from '../__tests__/parity/runParityScript';

describe.each(Object.keys(incomingScripts))('%s', name => {
  test('the services do what the sagas do', async () => {
    // eslint-disable-next-line security/detect-object-injection
    const script = incomingScripts[name];
    const sagas = await runParityScript(createReduxDriver, script);
    const services = await runParityScript(createServicesDriver, script);

    expect(services).toEqual(sagas);
  });
});
