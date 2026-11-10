/**
 * @jest-environment <rootDir>/../__tests__/unit.setup/HappyDOMEnvironmentWithTimeZone.js
 * @timezone America/Los_Angeles
 */
// The goldens hold local times (`localTimestamp` of the activities sent): the time zone is pinned to the one they were
// written in, and a zone with an offset pins how it is written too.
// Redux mode as a host sees it, against the golden records in `golden/`: every script of the parity specs (and of a
// host: `hostScripts.ts`) runs on core's Redux store, recording the actions as the outermost middleware sees them (with
// their dispatch depth) and the rest of the store's state, on top of what the other parity specs record. The goldens
// were written by redux-saga, before the machines replaced it, and are frozen: they are what Redux mode must still do.
//
// The goldens store each step's state as deltas (`deltaGolden.ts`); the spec rebuilds the whole records from them and
// compares those, so the comparison is the same as with whole records.
import { readFileSync } from 'fs';
import { join } from 'path';

import connectionScripts from './connectionScripts';
import createReduxDriver from './createReduxDriver';
import { fromDeltas } from './deltaGolden';
import encodeGolden, { takeEngineMessages } from './encodeGolden';
import hostScripts, { type HostScript } from './hostScripts';
import incomingScripts from './incomingScripts';
import outgoingScripts from './outgoingScripts';
import runParityScript, { type Script } from './runParityScript';
import sendScripts from './sendScripts';
import speechScripts from './speechScripts';
import voiceScripts from './voiceScripts';

const FAMILIES: Readonly<Record<string, Readonly<Record<string, HostScript | Script>>>> = Object.freeze({
  connection: connectionScripts,
  host: hostScripts,
  incoming: incomingScripts,
  outgoing: outgoingScripts,
  send: sendScripts,
  speech: speechScripts,
  voice: voiceScripts
});

const goldenPath = (family: string) => join(__dirname, '../../../__tests__/parity/golden', `${family}.json`);

describe.each(Object.keys(FAMILIES))('%s', family => {
  // eslint-disable-next-line security/detect-object-injection
  const scripts = FAMILIES[family];
  let golden: Record<string, any[]>;

  beforeAll(() => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    golden = JSON.parse(readFileSync(goldenPath(family), 'utf8'));
  });

  test.each(Object.keys(scripts))('%s', async name => {
    // eslint-disable-next-line security/detect-object-injection
    const entry = scripts[name];
    const { host, script } = typeof entry === 'function' ? { host: undefined, script: entry } : entry;

    takeEngineMessages();

    const records = encodeGolden(await runParityScript(createReduxDriver, script, { golden: true, host })) as any[];

    try {
      // eslint-disable-next-line security/detect-object-injection
      expect(records).toStrictEqual(fromDeltas(golden[name]));
    } catch (error) {
      // For the diagnosis only: the messages that the records replace with "[engine message]".
      const engineMessages = Array.from(new Set(takeEngineMessages()));

      if (engineMessages.length && error instanceof Error) {
        const note = `\n\nThe engine's messages in this run (not compared):\n${engineMessages.join('\n')}`;

        error.stack = error.stack?.replace(error.message, message => `${message}${note}`);
        error.message += note;
      }

      throw error;
    }
  });

  test('the golden has the scripts of the family, and no other', () => {
    expect(Object.keys(golden).sort()).toEqual(Object.keys(scripts).sort());
  });
});
