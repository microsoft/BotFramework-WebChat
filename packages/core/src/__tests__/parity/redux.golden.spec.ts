/**
 * @jest-environment <rootDir>/../__tests__/unit.setup/HappyDOMEnvironmentWithTimeZone.js
 * @timezone America/Los_Angeles
 */
// The goldens hold local times (`localTimestamp` of the activities sent): the time zone is pinned to the one they were
// written in, and a zone with an offset pins how it is written too.
// Redux mode as a host sees it, against the golden records in `golden/`: every script of the parity specs (and of a
// host: `hostScripts.ts`) runs on core's Redux store, recording the actions as the outermost middleware sees them (with
// their dispatch depth) and the rest of the store's state, on top of what the other parity specs record. The goldens
// were written by redux-saga: once the sagas are gone, they are what Redux mode must still do.
//
// The goldens store each step's state as deltas (`deltaGolden.ts`); the spec rebuilds the whole records from them and
// compares those, so the comparison is the same as with whole records.
//
// To write them again (on the sagas, while they exist; the machines are compared only):
//   WRITE_PARITY_GOLDEN=true npx jest packages/core/src/__tests__/parity/redux.golden.spec.ts
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import connectionScripts from './connectionScripts';
import createReduxDriver, { createMachinesDriver } from './createReduxDriver';
import { fromDeltas, toDeltas } from './deltaGolden';
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

const WRITE = process.env.WRITE_PARITY_GOLDEN === 'true';

// The goldens are written on the sagas only; both engines are compared to them.
const DRIVERS = Object.freeze(
  WRITE ? { saga: createReduxDriver } : { machines: createMachinesDriver, saga: createReduxDriver }
);

const RUNS = Object.keys(DRIVERS).flatMap(engine => Object.keys(FAMILIES).map(family => [engine, family] as const));

const goldenPath = (family: string) => join(__dirname, '../../../__tests__/parity/golden', `${family}.json`);

// Indented `depth` levels deep (script, step, field of the record, item of the field), each item below on one line: a
// change shows as the lines of the steps, the fields and the items that changed.
function stringify(value: unknown, depth: number, indent = ''): string {
  if (!depth || !value || typeof value !== 'object' || !Object.keys(value).length) {
    return JSON.stringify(value);
  }

  const inner = `${indent}  `;
  const lines = Array.isArray(value)
    ? value.map(item => `${inner}${stringify(item, depth - 1, inner)}`)
    : Object.entries(value).map(
        ([key, item]) => `${inner}${JSON.stringify(key)}: ${stringify(item, depth - 1, inner)}`
      );

  return Array.isArray(value) ? `[\n${lines.join(',\n')}\n${indent}]` : `{\n${lines.join(',\n')}\n${indent}}`;
}

describe.each(RUNS)('%s: %s', (engine, family) => {
  // eslint-disable-next-line security/detect-object-injection
  const scripts = FAMILIES[family];
  const written: Record<string, unknown> = {};
  let golden: Record<string, any[]>;

  beforeAll(() => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    WRITE || (golden = JSON.parse(readFileSync(goldenPath(family), 'utf8')));
  });

  afterAll(() => {
    // Only a run of every script of the family writes it (not one filtered with `-t`).
    if (WRITE && Object.keys(written).length === Object.keys(scripts).length) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      mkdirSync(dirname(goldenPath(family)), { recursive: true });
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      writeFileSync(goldenPath(family), `${stringify(written, 4)}\n`);
    }
  });

  test.each(Object.keys(scripts))('%s', async name => {
    // eslint-disable-next-line security/detect-object-injection
    const entry = scripts[name];
    const { host, script } = typeof entry === 'function' ? { host: undefined, script: entry } : entry;

    takeEngineMessages();

    const records = encodeGolden(
      // eslint-disable-next-line security/detect-object-injection
      await runParityScript(DRIVERS[engine], script, { golden: true, host })
    ) as any[];

    if (WRITE) {
      // eslint-disable-next-line security/detect-object-injection
      written[name] = toDeltas(records);
    } else {
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
    }
  });

  test('the golden has the scripts of the family, and no other', () => {
    WRITE || expect(Object.keys(golden).sort()).toEqual(Object.keys(scripts).sort());
  });
});
