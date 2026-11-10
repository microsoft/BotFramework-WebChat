/**
 * @jest-environment @happy-dom/jest-environment
 */
// Redux mode on the machines against Redux mode on the sagas, live: every script of the golden spec runs on both
// engines, recorded as for the goldens (the actions as the outermost middleware sees them, with their depth, and the
// whole store), and the records must be the same. Unlike the golden spec, this needs no golden written beforehand, and
// it reads in any time zone (both runs are in the same one).
import connectionScripts from './connectionScripts';
import createReduxDriver, { createMachinesDriver } from './createReduxDriver';
import encodeGolden from './encodeGolden';
import hostScripts, { type HostScript } from './hostScripts';
import incomingScripts from './incomingScripts';
import outgoingScripts from './outgoingScripts';
import runParityScript, { type Script } from './runParityScript';
import sendScripts from './sendScripts';
import speechScripts from './speechScripts';
import voiceScripts from './voiceScripts';

const SCRIPTS: Readonly<Record<string, HostScript | Script>> = Object.freeze({
  ...Object.fromEntries(Object.entries(connectionScripts).map(([name, script]) => [`connection: ${name}`, script])),
  ...Object.fromEntries(Object.entries(hostScripts).map(([name, script]) => [`host: ${name}`, script])),
  ...Object.fromEntries(Object.entries(incomingScripts).map(([name, script]) => [`incoming: ${name}`, script])),
  ...Object.fromEntries(Object.entries(outgoingScripts).map(([name, script]) => [`outgoing: ${name}`, script])),
  ...Object.fromEntries(Object.entries(sendScripts).map(([name, script]) => [`send: ${name}`, script])),
  ...Object.fromEntries(Object.entries(speechScripts).map(([name, script]) => [`speech: ${name}`, script])),
  ...Object.fromEntries(Object.entries(voiceScripts).map(([name, script]) => [`voice: ${name}`, script]))
});

test.each(Object.keys(SCRIPTS))('%s', async name => {
  // eslint-disable-next-line security/detect-object-injection
  const entry = SCRIPTS[name];
  const { host, script } = typeof entry === 'function' ? { host: undefined, script: entry } : entry;
  const sagas = encodeGolden(await runParityScript(createReduxDriver, script, { golden: true, host }));
  const machines = encodeGolden(await runParityScript(createMachinesDriver, script, { golden: true, host }));

  expect(machines).toStrictEqual(sagas);
});
