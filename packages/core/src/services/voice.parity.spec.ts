/**
 * @jest-environment @happy-dom/jest-environment
 */
// The voice service and the voice posts of the outgoing service against Redux mode (on the sagas and on the machines):
// every script of speech-to-speech
// runs on both, and after every step, the voice values (each change, and their order), the calls to the voice handlers,
// the calls to Direct Line and the activities posted, the warnings and errors must be the same.
import { REDUX_DRIVERS } from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import runParityScript from '../__tests__/parity/runParityScript';
import voiceScripts from '../__tests__/parity/voiceScripts';

describe.each(Object.keys(voiceScripts))('%s', name => {
  test.each(REDUX_DRIVERS)('the services do what Redux mode does, on the %s', async (_, createReduxDriver) => {
    // eslint-disable-next-line security/detect-object-injection
    const script = voiceScripts[name];
    const sagas = await runParityScript(createReduxDriver, script, { speech: true });
    const services = await runParityScript(createServicesDriver, script, { speech: true });

    // Strict: a key set to `undefined` is not a missing key (the `value` of an event posted).
    expect(services).toStrictEqual(sagas);
  });
});
