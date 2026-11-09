/// <reference types="jest" />
/* eslint-disable no-magic-numbers */
// Runs one script of the parity specs on a driver (the sagas through a Redux store, or the services) and records what
// a host can observe, step by step: the calls to Direct Line and the activities posted, the values of connectivity
// status, reference grammar ID, notifications, activities and send box (each change, in order, and the order of the
// changes across values), the suggested actions set or cleared, `console.warn/error`, and the timers.
import lolex from 'lolex';

import createMockDirectLine, { type MockDirectLine, type MockDirectLineInit } from './createMockDirectLine';

type Observation = {
  readonly activities: readonly unknown[];
  readonly connectivityStatus: string;
  readonly notifications: Readonly<Record<string, unknown>>;
  readonly referenceGrammarID: string | null;
  readonly sendBoxAttachments: readonly unknown[];
  readonly sendBoxValue: string;
  readonly sendTypingIndicator: boolean;
};

type ObservationKey = keyof Observation;

type Faults = {
  /** Makes "the post is fulfilled" throw, for the echo with this text. */
  fulfilledThrowsFor?: string | undefined;
  /** Makes "post the activity" (pending) throw, for the activity with this text. */
  pendingThrowsFor?: string | undefined;
  /** Makes "receive the activity" throw, for the activity with this ID (the reducer, or the activities store). */
  receiveThrowsFor?: string | undefined;
  /** Makes a listener of the connectivity status throw when the status becomes this value. */
  statusListenerThrowsOn?: string | undefined;
};

/** The operations of Web Chat, with the arguments of the action creators of the same names. */
type Operations = {
  readonly clearSuggestedActions: () => void;
  readonly emitTypingIndicator: () => void;
  readonly markActivity: (activity: { id: string }, name: string, value: unknown) => void;
  readonly postActivity: (activity: any, method?: string | undefined) => void;
  readonly sendEvent: (name: string, value?: unknown) => void;
  readonly sendFiles: (files: readonly any[]) => void;
  readonly sendMessage: (
    text: string | undefined,
    method?: string | undefined,
    init?: { attachments?: readonly any[]; channelData?: any; replyToId?: string | undefined }
  ) => void;
  readonly sendMessageBack: (
    value: unknown,
    text?: string | undefined,
    displayText?: string | undefined,
    init?: { replyToId?: string | undefined }
  ) => void;
  readonly sendPostBack: (value: unknown, init?: { replyToId?: string | undefined }) => void;
  readonly setLanguage: (language: string) => void;
  readonly setSendBox: (text: string) => void;
  readonly setSendBoxAttachments: (attachments: readonly any[]) => void;
  readonly setSendTimeout: (sendTimeout: number) => void;
  readonly setSendTypingIndicator: (value: boolean) => void;
  readonly submitSendBox: (method?: string | undefined, init?: { channelData?: any }) => void;
};

type DriverInit = {
  readonly faults: Faults;
  /** Called on every change of an observed value, in order. */
  readonly onChange: (key: ObservationKey, value: unknown) => void;
  /** Called with the suggested actions set by the incoming activities, and their origin; `[]` when cleared. */
  readonly onSuggestedActions: (actions: readonly unknown[], origin: unknown) => void;
  readonly ponyfill: any;
};

type Driver = {
  readonly connect: (init: { directLine: any; userID?: unknown; username?: string | undefined }) => void;
  readonly disconnect: () => void;
  readonly dispose: () => void;
  readonly observe: () => Observation;
  readonly ops: Operations;
  /** The `dispatch()` given to card action middleware: the store's in Redux mode. */
  readonly rawDispatch: (action: any) => unknown;
};

type CreateDriver = (init: DriverInit) => Driver;

type StepRecord = {
  readonly calls: readonly string[];
  readonly changes: Readonly<Partial<Record<ObservationKey, readonly unknown[]>>>;
  readonly console: readonly string[];
  readonly label: string;
  /**
   * The order of what changed, across values: each change of an observed value (its key), each suggested actions
   * event (`suggestedActions`), and each call about posting (`postActivity`, the subscriptions of what it returned).
   */
  readonly order: readonly string[];
  /** The activities posted to Direct Line. */
  readonly posted: readonly unknown[];
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

type RunOptions = {
  /** Keeps the random IDs (client activity IDs, local IDs), to check that the normalization is needed. */
  readonly raw?: boolean | undefined;
};

async function flush(): Promise<void> {
  // The sagas hand values over through promises: 20 turns are more than any chain in the scripts.
  for (let index = 0; index < 20; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

// The IDs that are random on each run, by key: they are replaced by their rank of first appearance in the records
// (`<cid 1>`, `<lid 1>`), so two runs compare equal only if the same IDs appear at the same places. The same for the
// random user ID (`r_` and up to 10 characters, `<user 1>`), in any string.
const RANDOM_ID_KEYS: Readonly<Record<string, string>> = Object.freeze({
  clientActivityID: 'cid',
  'webchat:internal:local-id': 'lid'
});

const RANDOM_USER_ID = /\br_[\da-z]{1,10}\b/gu;

function normalizeRandomIDs<T>(records: T): T {
  const ranks = new Map<string, string>();
  const counts: Record<string, number> = {};

  const rank = (kind: string, value: string): string => {
    const rankKey = `${kind}:${value}`;

    if (!ranks.has(rankKey)) {
      // eslint-disable-next-line security/detect-object-injection
      counts[kind] = (counts[kind] || 0) + 1;
      // eslint-disable-next-line security/detect-object-injection
      ranks.set(rankKey, `<${kind} ${counts[kind]}>`);
    }

    return ranks.get(rankKey);
  };

  const walk = (value: unknown, key?: string): unknown => {
    // eslint-disable-next-line security/detect-object-injection
    const kind = key && RANDOM_ID_KEYS[key];

    if (typeof value === 'string') {
      return kind ? rank(kind, value) : value.replace(RANDOM_USER_ID, userID => rank('user', userID));
    } else if (Array.isArray(value)) {
      return value.map(item => walk(item));
    } else if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, walk(child, childKey)]));
    }

    return value;
  };

  return walk(records) as T;
}

function describeConsoleArgs(args: unknown[]): string {
  return args
    .map(arg => (arg instanceof Error ? `Error(${arg.message})` : typeof arg === 'string' ? arg : `[${typeof arg}]`))
    .join(' ');
}

export default async function runParityScript(
  createDriver: CreateDriver,
  script: Script,
  { raw }: RunOptions = {}
): Promise<StepRecord[]> {
  const clock = lolex.createClock();
  const calls: string[] = [];
  const changes: Partial<Record<ObservationKey, unknown[]>> = {};
  const consoleLog: string[] = [];
  const directLines: MockDirectLine[] = [];
  const faults: Faults = {};
  const order: string[] = [];
  const records: StepRecord[] = [];
  const suggestedActions: unknown[] = [];
  const timers: string[] = [];

  // The calls that post are also in the order of changes, to pin when they happen (e.g. pending before posting). Not
  // the unsubscriptions: when they happen after the value, by a microtask or two, is not observable.
  const log = (message: string) => {
    calls.push(message);
    /\.(postActivity#\d+|post#\d+\.subscribe#\d+)$/u.test(message) && order.push(message);
  };

  // The timers set through the ponyfill (the slow connection timer, the reply hold, the send timeouts), by delay.
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

  // The URLs of the attachments sent: numbered, in order.
  // eslint-disable-next-line no-restricted-properties
  const { createObjectURL } = URL;
  let numObjectURLs = 0;

  // eslint-disable-next-line no-restricted-properties
  URL.createObjectURL = () => `blob:${++numObjectURLs}`;

  let driver: Driver | undefined;

  try {
    driver = createDriver({
      faults,
      onChange: (key, value) => {
        // eslint-disable-next-line security/detect-object-injection
        (changes[key] || (changes[key] = [])).push(value);
        order.push(key);
      },
      onSuggestedActions: (actions, origin) => {
        suggestedActions.push({ actions, origin: origin && (origin as any).id });
        order.push('suggestedActions');
      },
      ponyfill
    });

    const context: ScriptContext = {
      clock,
      createDirectLine: init => {
        const mock = createMockDirectLine({ push: log }, init);

        directLines.push(mock);

        return mock;
      },
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
          order: order.splice(0),
          posted: directLines.flatMap(mock => mock.takePosted()),
          state: driver.observe(),
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
    // eslint-disable-next-line no-restricted-properties, require-atomic-updates
    URL.createObjectURL = createObjectURL;
  }

  // Leave no empty change lists, so a record reads well in a failure.
  const result = records.map(record => ({
    ...record,
    changes: Object.fromEntries(Object.entries(record.changes).filter(([, values]) => values.length))
  }));

  return raw ? result : normalizeRandomIDs(result);
}

export { normalizeRandomIDs };

export type {
  CreateDriver,
  Driver,
  DriverInit,
  Faults,
  Observation,
  Operations,
  RunOptions,
  Script,
  ScriptContext,
  StepRecord
};
