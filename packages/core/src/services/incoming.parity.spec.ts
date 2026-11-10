/**
 * @jest-environment @happy-dom/jest-environment
 */
// The incoming service against Redux mode, on the sagas and on the machines: every script of the incoming parity spec
// runs on both, and after every step, the calls to Direct Line, the activities, the suggested actions set, connectivity
// status, notifications, the warnings and errors, and the timers set must be the same.
import { REDUX_DRIVERS } from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import incomingScripts from '../__tests__/parity/incomingScripts';
import runParityScript, { type StepRecord } from '../__tests__/parity/runParityScript';

// After a saga error, the services keep the connect loop running, as the sagas did only when Jest down-leveled them with
// regenerator; on native generators every saga stops. Compared until the next connect.
const UNTIL_CONNECT_AGAIN = Object.freeze([
  'fatal: an activity that is not an object',
  'fatal: receiving an activity throws'
]);

function untilConnectAgain(records: readonly StepRecord[]): readonly StepRecord[] {
  return records.slice(
    0,
    records.findIndex(({ label }) => label === 'connect again')
  );
}

describe.each(Object.keys(incomingScripts))('%s', name => {
  test.each(REDUX_DRIVERS)('the services do what Redux mode does, on the %s', async (_, createReduxDriver) => {
    // eslint-disable-next-line security/detect-object-injection
    const script = incomingScripts[name];
    const cut = UNTIL_CONNECT_AGAIN.includes(name) ? untilConnectAgain : (records: readonly StepRecord[]) => records;
    const sagas = await runParityScript(createReduxDriver, script);
    const services = await runParityScript(createServicesDriver, script);

    expect(cut(services)).toEqual(cut(sagas));
  });
});
