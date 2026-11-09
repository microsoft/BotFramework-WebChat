/**
 * @jest-environment @happy-dom/jest-environment
 */
// The connection service and the notifications cell against the sagas: every script of the connection parity spec runs
// on both, and after every step, the calls to Direct Line, the values of connectivity status, reference grammar ID,
// notifications and activities, the warnings and errors, and the timers set must be the same.
import connectionScripts from '../__tests__/parity/connectionScripts';
import createReduxDriver from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import runParityScript, { type StepRecord } from '../__tests__/parity/runParityScript';

// Throwing from a listener of the status is not reachable in Web Chat: the listeners are the hooks, which re-render.
// On "connected" and "reconnecting", the sagas fail the connection instead of stopping (and on "connected", leak the
// keep-alive subscription); the services stop as on any other error. See the test below.
const DIFFERENT = Object.freeze([
  'fatal: a listener of the status throws on connected',
  'fatal: a listener of the status throws on reconnecting'
]);

// The user ID is random when none is valid.
function normalize(records: readonly StepRecord[]): unknown {
  return JSON.parse(JSON.stringify(records).replace(/r_[\da-z]{10}/gu, 'r_<random>'));
}

describe.each(Object.keys(connectionScripts).filter(name => !DIFFERENT.includes(name)))('%s', name => {
  test('the services do what the sagas do', async () => {
    // eslint-disable-next-line security/detect-object-injection
    const script = connectionScripts[name];
    const sagas = await runParityScript(createReduxDriver, script);
    const services = await runParityScript(createServicesDriver, script);

    expect(normalize(services)).toEqual(normalize(sagas));
  });
});

describe('a listener of the status that throws', () => {
  test.each(DIFFERENT)('%s: stops everything, as any other error', async name => {
    // eslint-disable-next-line security/detect-object-injection
    const records = await runParityScript(createServicesDriver, connectionScripts[name]);

    expect(records.map(({ label, state: { connectivityStatus } }) => [label, connectivityStatus])).toEqual(
      expect.arrayContaining([expect.arrayContaining(['sagaerror'])])
    );
    expect(records.flatMap(({ console }) => console)).toEqual([expect.stringMatching(/^error: Error\(listener on /u)]);
  });
});
