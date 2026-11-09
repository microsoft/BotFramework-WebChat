/**
 * @jest-environment @happy-dom/jest-environment
 */
// The send box service against the sagas: every script of the send box, submit and typing indicator runs on both, and
// after every step, the calls to Direct Line, the activities posted, every change of the send box and the activities
// (and their order), the suggested actions cleared, the warnings and errors, and the timers set must be the same.
import createReduxDriver from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import runParityScript from '../__tests__/parity/runParityScript';
import sendScripts from '../__tests__/parity/sendScripts';

const scripts = Object.fromEntries(
  Object.entries(sendScripts).filter(([name]) => /^(send box|submit|typing)\b/u.test(name))
);

describe.each(Object.keys(scripts))('%s', name => {
  test('the services do what the sagas do', async () => {
    // eslint-disable-next-line security/detect-object-injection
    const script = scripts[name];
    const sagas = await runParityScript(createReduxDriver, script);
    const services = await runParityScript(createServicesDriver, script);

    // Strict: a key set to `undefined` is not a missing key.
    expect(services).toStrictEqual(sagas);
  });
});
