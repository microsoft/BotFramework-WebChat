/**
 * @jest-environment @happy-dom/jest-environment
 */
// The outgoing service against Redux mode (on the sagas and on the machines): every posting script, and the scripts of
// the senders, run on both, and after
// every step, the calls to Direct Line, the activities posted, every change of the activities and the other values (and
// their order), the suggested actions set or cleared, the warnings and errors, and the timers set must be the same.
import { REDUX_DRIVERS } from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import outgoingScripts from '../__tests__/parity/outgoingScripts';
import runParityScript from '../__tests__/parity/runParityScript';
import sendScripts from '../__tests__/parity/sendScripts';

// The scripts of the send box, the typing indicator and the raw actions run with the send box service and the api.
const scripts = {
  ...outgoingScripts,
  ...Object.fromEntries(
    Object.entries(sendScripts).filter(([name]) => !/^(dispatch|send box|submit|typing)\b/u.test(name))
  )
};

describe.each(Object.keys(scripts))('%s', name => {
  test.each(REDUX_DRIVERS)('the services do what Redux mode does, on the %s', async (_, createReduxDriver) => {
    // eslint-disable-next-line security/detect-object-injection
    const script = scripts[name];
    const sagas = await runParityScript(createReduxDriver, script);
    const services = await runParityScript(createServicesDriver, script);

    // Strict: a key set to `undefined` is not a missing key (`'replyToId' in activity`).
    expect(services).toStrictEqual(sagas);
  });
});
