// The golden records, stored as deltas: each step's `state` and `store` as the change from the previous step's, and each
// value in `changes` as the change from the value before it (the previous change of that key, or the previous step's
// state). The first of each is whole. The actions stay whole, one per line, to read.
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

const isObject = (value: unknown): value is JSONObject => !!value && typeof value === 'object' && !Array.isArray(value);

const isDelta = (value: unknown): value is { [DELTA]: JSONObject } => isObject(value) && DELTA in value;

/** The value that `change` makes of `base`. */
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

/** The records of a script (plain JSON, in order) from their deltas. */
function fromDeltas<T extends Record>(records: readonly T[]): T[] {
  // The last value of each key: of its last change, or of the state after the last step.
  const last: JSONObject = {};
  let lastState: unknown;
  let lastStore: unknown;

  return records.map(record => {
    const changes = Object.fromEntries(
      Object.entries(record.changes).map(([key, values]) => [
        key,
        values.map(item => {
          // eslint-disable-next-line security/detect-object-injection
          const value = patch(last[key], item);

          // eslint-disable-next-line security/detect-object-injection
          last[key] = value;

          return value;
        })
      ])
    );

    const state = patch(lastState, record.state);
    const store = patch(lastStore, record.store);

    lastState = state;
    lastStore = store;
    isObject(lastState) && Object.assign(last, lastState);

    return { ...record, changes, state, store };
  });
}

export { fromDeltas };
