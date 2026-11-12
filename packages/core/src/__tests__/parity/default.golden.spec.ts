/**
 * @jest-environment <rootDir>/../__tests__/unit.setup/HappyDOMEnvironmentWithTimeZone.js
 * @timezone America/Los_Angeles
 */
// Default mode against the golden records of Redux mode (`golden/`, see `redux.golden.spec.ts`): every script runs on
// the default engine (reducer groups, activities store, the same machines), recording the actions as the outermost
// middleware of a Redux store would see them. The records must be those of Redux mode, except:
//
// - `store`: the rest of the Redux store's state (`readyState`, `typing`, the suggested actions mirror) does not exist
//   in default mode, except `sendTimeout`, which is compared;
// - the scripts of a host with a middleware or a store listener: default mode has no store to add them to.
import { readFileSync } from 'fs';
import { join } from 'path';

import connectionScripts from './connectionScripts';
import createDefaultDriver from './createDefaultDriver';
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

const withoutStore = (records: readonly any[]) =>
  records.map(({ store, ...record }) =>
    // Of the rest of the Redux store's state, default mode has `sendTimeout` (its outgoing group).
    store ? { ...record, store: { sendTimeout: store.sendTimeout } } : record
  );

describe.each(Object.keys(FAMILIES))('%s', family => {
  // eslint-disable-next-line security/detect-object-injection
  const scripts = FAMILIES[family];
  const names = Object.keys(scripts).filter(name => {
    // eslint-disable-next-line security/detect-object-injection
    const entry = scripts[name];

    return typeof entry === 'function' || !(entry.host?.listener || entry.host?.middleware);
  });

  let golden: Record<string, any[]>;

  beforeAll(() => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    golden = JSON.parse(readFileSync(goldenPath(family), 'utf8'));
  });

  test.each(names)('%s', async name => {
    // eslint-disable-next-line security/detect-object-injection
    const entry = scripts[name];
    const script = typeof entry === 'function' ? entry : entry.script;

    takeEngineMessages();

    const records = encodeGolden(await runParityScript(createDefaultDriver, script, { golden: true })) as any[];

    // eslint-disable-next-line security/detect-object-injection
    expect(withoutStore(records)).toStrictEqual(withoutStore(fromDeltas(golden[name])));
  });
});
