// The golden records, stored as deltas: each step's `state` and `store` as the change from the previous step's, and each
// value in `changes` as the change from the value before it (the previous change of that key, or the previous step's
// state). The first of each is whole. `fromDeltas(toDeltas(records))` gives the records back, so nothing is lost. The
// actions stay whole, one per line, to read.
//
// A change is either the new value itself, or a delta `{ "[~]": { <key>: <change> } }` of the keys that changed (of an
// array: the indices, and `length` if it changed), where `"[removed]"` is a key removed. The values are plain JSON
// (`encodeGolden()`), which has no `"[~]"` key and no `"[removed]"` string of its own.

const DELTA = '[~]';
const REMOVED = '[removed]';

type JSONObject = { [key: string]: unknown };

/** The records of one step that are stored as deltas. */
type Record = {
  readonly changes: Readonly<{ [key: string]: readonly unknown[] }>;
  readonly state: unknown;
  readonly store?: unknown;
};

const isEqual = (x: unknown, y: unknown): boolean => JSON.stringify(x) === JSON.stringify(y);

const isObject = (value: unknown): value is JSONObject => !!value && typeof value === 'object' && !Array.isArray(value);

const isDelta = (value: unknown): value is { [DELTA]: JSONObject } => isObject(value) && DELTA in value;

/** The change from `base` to `value`: a delta of two arrays or two objects, if shorter than `value`; else `value`. */
function diff(base: unknown, value: unknown): unknown {
  const isArrays = Array.isArray(base) && Array.isArray(value);

  if (!isArrays && !(isObject(base) && isObject(value))) {
    return value;
  }

  const baseEntries: JSONObject = base as JSONObject;
  const valueEntries: JSONObject = value as JSONObject;
  const changes: JSONObject = {};

  if (isArrays) {
    (value as unknown[]).length === (base as unknown[]).length || (changes.length = (value as unknown[]).length);
  } else {
    for (const key of Object.keys(baseEntries)) {
      // eslint-disable-next-line security/detect-object-injection
      key in valueEntries || (changes[key] = REMOVED);
    }
  }

  for (const key of Object.keys(valueEntries)) {
    // eslint-disable-next-line security/detect-object-injection
    isEqual(baseEntries[key], valueEntries[key]) || (changes[key] = diff(baseEntries[key], valueEntries[key]));
  }

  const delta = { [DELTA]: changes };

  return JSON.stringify(delta).length < JSON.stringify(value).length ? delta : value;
}

/** The value that `change` (from `diff()`) makes of `base`. */
function patch(base: unknown, change: unknown): unknown {
  if (!isDelta(change)) {
    return change;
  }

  const { [DELTA]: changes } = change;

  if (Array.isArray(base)) {
    const result = base.slice();

    typeof changes.length === 'number' && (result.length = changes.length);

    for (const [key, item] of Object.entries(changes)) {
      key === 'length' || (result[+key] = patch(base[+key], item));
    }

    return result;
  }

  const result: JSONObject = { ...(base as JSONObject) };

  for (const [key, item] of Object.entries(changes)) {
    // eslint-disable-next-line security/detect-object-injection
    item === REMOVED ? delete result[key] : (result[key] = patch((base as JSONObject)[key], item));
  }

  return result;
}

/** Converts the records of a script (plain JSON, in order) to or from deltas. */
function convert<T extends Record>(records: readonly T[], toDelta: boolean): T[] {
  // The last value of each key: of its last change, or of the state after the last step.
  const last: JSONObject = {};
  let lastState: unknown;
  let lastStore: unknown;

  const next = (base: unknown, item: unknown) => (toDelta ? diff(base, item) : patch(base, item));

  return records.map(record => {
    const changes = Object.fromEntries(
      Object.entries(record.changes).map(([key, values]) => [
        key,
        values.map(item => {
          // eslint-disable-next-line security/detect-object-injection
          const converted = next(last[key], item);

          // eslint-disable-next-line security/detect-object-injection
          last[key] = toDelta ? item : converted;

          return converted;
        })
      ])
    );

    const state = next(lastState, record.state);
    const store = next(lastStore, record.store);

    lastState = toDelta ? record.state : state;
    lastStore = toDelta ? record.store : store;
    isObject(lastState) && Object.assign(last, lastState);

    return { ...record, changes, state, store };
  });
}

/** The records of a script as deltas. */
const toDeltas = <T extends Record>(records: readonly T[]): T[] => convert(records, true);

/** The records of a script from their deltas. */
const fromDeltas = <T extends Record>(records: readonly T[]): T[] => convert(records, false);

export { fromDeltas, toDeltas };
