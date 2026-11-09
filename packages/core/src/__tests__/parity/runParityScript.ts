/// <reference types="jest" />
/* eslint-disable no-magic-numbers */
// Runs one script of the parity specs on a driver (the sagas through a Redux store, or the services) and records what
// a host can observe, step by step: the calls to Direct Line, the values of connectivity status, reference grammar ID,
// notifications and activities (each change, in order), the suggested actions set, `console.warn/error`, and the timers.
import lolex from 'lolex';

import createMockDirectLine, { type MockDirectLine, type MockDirectLineInit } from './createMockDirectLine';

type Observation = {
  readonly activities: readonly unknown[];
  readonly connectivityStatus: string;
  readonly notifications: Readonly<Record<string, unknown>>;
  readonly referenceGrammarID: string | null;
};

type ObservationKey = keyof Observation;

type Faults = {
  /** Makes "receive the activity" throw, for the activity with this ID (the reducer, or the activities store). */
  receiveThrowsFor?: string | undefined;
  /** Makes a listener of the connectivity status throw when the status becomes this value. */
  statusListenerThrowsOn?: string | undefined;
};

type DriverInit = {
  readonly faults: Faults;
  /** Called on every change of an observed value, in order. */
  readonly onChange: (key: ObservationKey, value: unknown) => void;
  /** Called with the suggested actions set by the incoming activities, and their origin. */
  readonly onSuggestedActions: (actions: readonly unknown[], origin: unknown) => void;
  readonly ponyfill: any;
};

type Driver = {
  readonly connect: (init: { directLine: any; userID?: unknown; username?: string | undefined }) => void;
  readonly disconnect: () => void;
  readonly dispose: () => void;
  readonly observe: () => Observation;
};

type CreateDriver = (init: DriverInit) => Driver;

type StepRecord = {
  readonly calls: readonly string[];
  readonly changes: Readonly<Partial<Record<ObservationKey, readonly unknown[]>>>;
  readonly console: readonly string[];
  readonly label: string;
  readonly state: Observation;
  readonly suggestedActions: readonly unknown[];
  readonly timers: readonly string[];
};

type ScriptContext = {
  readonly clock: any;
  readonly createDirectLine: (init: MockDirectLineInit) => MockDirectLine;
  readonly driver: Driver;
  readonly faults: Faults;
  /** Runs `fn` (if any), lets the promises settle, then records what changed since the previous step. */
  readonly step: (label: string, fn?: () => void) => Promise<void>;
};

type Script = (context: ScriptContext) => Promise<void>;

async function flush(): Promise<void> {
  // The sagas hand values over through promises: 20 turns are more than any chain in the scripts.
  for (let index = 0; index < 20; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

/** Activities without their local ID, which is random. */
function stripActivity(activity: any): unknown {
  if (!activity || typeof activity !== 'object') {
    return activity;
  }

  const { channelData: { 'webchat:internal:local-id': _, ...channelData } = {} as any, ...rest } = activity;

  return { ...rest, channelData };
}

function stripObservation(observation: Observation): Observation {
  return { ...observation, activities: observation.activities.map(stripActivity) };
}

function describeConsoleArgs(args: unknown[]): string {
  return args
    .map(arg => (arg instanceof Error ? `Error(${arg.message})` : typeof arg === 'string' ? arg : `[${typeof arg}]`))
    .join(' ');
}

export default async function runParityScript(createDriver: CreateDriver, script: Script): Promise<StepRecord[]> {
  const clock = lolex.createClock();
  const calls: string[] = [];
  const changes: Partial<Record<ObservationKey, unknown[]>> = {};
  const consoleLog: string[] = [];
  const faults: Faults = {};
  const records: StepRecord[] = [];
  const suggestedActions: unknown[] = [];
  const timers: string[] = [];

  // The timers set through the ponyfill (the slow connection timer, the reply hold), by delay.
  const { setTimeout } = clock;

  const ponyfill = {
    ...clock,
    setTimeout: (fn: () => void, delay: number) => {
      timers.push(`setTimeout(${delay})`);

      return setTimeout.call(clock, fn, delay);
    }
  };

  const errorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
    consoleLog.push(`error: ${describeConsoleArgs(args)}`);
  });

  const warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args) => {
    consoleLog.push(`warn: ${describeConsoleArgs(args)}`);
  });

  let driver: Driver | undefined;

  try {
    driver = createDriver({
      faults,
      onChange: (key, value) => {
        // eslint-disable-next-line security/detect-object-injection
        (changes[key] || (changes[key] = [])).push(key === 'activities' ? (value as any[]).map(stripActivity) : value);
      },
      onSuggestedActions: (actions, origin) =>
        suggestedActions.push({ actions, origin: origin && (stripActivity(origin) as any).id }),
      ponyfill
    });

    const context: ScriptContext = {
      clock,
      createDirectLine: init => createMockDirectLine(calls, init),
      driver,
      faults,
      step: async (label, fn) => {
        fn?.();

        await flush();

        records.push({
          calls: calls.splice(0),
          changes: Object.fromEntries(Object.entries(changes).map(([key, values]) => [key, values.splice(0)])),
          console: consoleLog.splice(0),
          label,
          state: stripObservation(driver.observe()),
          suggestedActions: suggestedActions.splice(0),
          timers: timers.splice(0)
        });

        // Empty lists are not changes.
        for (const key of Object.keys(changes)) {
          // eslint-disable-next-line security/detect-object-injection
          changes[key].length || delete changes[key];
        }
      }
    };

    await script(context);
  } finally {
    driver?.dispose();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  }

  // Leave no empty change lists, so a record reads well in a failure.
  return records.map(record => ({
    ...record,
    changes: Object.fromEntries(Object.entries(record.changes).filter(([, values]) => values.length))
  }));
}

export type { CreateDriver, Driver, DriverInit, Faults, Observation, Script, ScriptContext, StepRecord };
