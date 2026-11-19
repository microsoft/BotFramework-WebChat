import type { InternalNode } from './InternalNode.ts';
import type { UnfrozenNode } from './UnfrozenNode.ts';

// Hidden property on the node to cache the parsed `dateCreated`, so sorting does not parse it on every comparison.
// Numbers are cached instead of a `Date` object because `Date` is mutable.
const dateCreatedTimeSymbol = Symbol('dateCreatedTime');

/**
 * Parsed `dateCreated`: epoch time in milliseconds (`Infinity` if not set), and nanoseconds within the millisecond.
 *
 * Nanoseconds are kept separately because epoch time in nanoseconds cannot be represented exactly as a number.
 */
type DateCreatedTime = readonly [time: number, nanoseconds: number];

// Fractional seconds: 3 digits of milliseconds, followed by 6 digits down to nanoseconds.
const NUM_MILLISECOND_DIGITS = 3;
const NUM_NANOSECOND_DIGITS = 9;
const NUM_SUB_MILLISECOND_DIGITS = NUM_NANOSECOND_DIGITS - NUM_MILLISECOND_DIGITS;

const NOT_SET: DateCreatedTime = Object.freeze([Infinity, 0] as const);

type NodeWithDateCreatedTime = (InternalNode | UnfrozenNode) & {
  readonly [dateCreatedTimeSymbol]?: DateCreatedTime | undefined;
};

/**
 * Parses `dateCreated` (ISO timestamp string) and returns its epoch time with nanoseconds, `Infinity` if not set.
 *
 * ISO timestamps with different time zones (e.g. `+02:00` and `Z`) cannot be compared as string.
 *
 * `Date` truncates fractional seconds to milliseconds, digits after milliseconds (up to nanoseconds) are parsed
 * separately, so sub-millisecond `dateCreated` are sorted correctly. Time zone offsets are in minutes, they do not
 * affect sub-millisecond digits.
 */
function parseDateCreatedTime(dateCreated: string | undefined): DateCreatedTime {
  if (typeof dateCreated !== 'string') {
    return NOT_SET;
  }

  // The date part does not contain ".", so the first "." is always the decimal point of seconds.
  const [, fraction = ''] = /\.(\d+)/u.exec(dateCreated) ?? [];

  return Object.freeze([
    // eslint-disable-next-line no-restricted-globals
    new Date(dateCreated).getTime(),
    +fraction.slice(NUM_MILLISECOND_DIGITS, NUM_NANOSECOND_DIGITS).padEnd(NUM_SUB_MILLISECOND_DIGITS, '0')
  ] as const);
}

/**
 * Compares 2 parsed `dateCreated`, returns a negative number if `x` is earlier, positive if later, `0` if the same.
 */
function compareDateCreatedTime(
  [xTime, xNanoseconds]: DateCreatedTime,
  [yTime, yNanoseconds]: DateCreatedTime
): number {
  return xTime === yTime
    ? Number(xNanoseconds > yNanoseconds) - Number(xNanoseconds < yNanoseconds)
    : Number(xTime > yTime) - Number(xTime < yTime);
}

/**
 * Caches the parsed `dateCreated` on the node as a hidden non-enumerable property. The node must not be frozen yet.
 */
function attachDateCreatedTime<T extends object>(node: T, dateCreatedTime: DateCreatedTime): T {
  return Object.defineProperty(node, dateCreatedTimeSymbol, { value: dateCreatedTime });
}

/**
 * Gets the cached `dateCreated` with nanoseconds, `Infinity` if not set. Use it for sorting and comparison.
 *
 * Only nodes created by `createNode()` have the cache, it is kept by `ReadWriteNode`, so it is not parsed again.
 */
function getPreciseDateCreatedTime(node: NodeWithDateCreatedTime | undefined): DateCreatedTime {
  // eslint-disable-next-line security/detect-object-injection
  return node?.[dateCreatedTimeSymbol] ?? NOT_SET;
}

/**
 * Gets the cached `dateCreated` as epoch time in milliseconds, `Infinity` if not set.
 *
 * Sub-millisecond digits are truncated, use `getPreciseDateCreatedTime()` for sorting and comparison.
 */
function getDateCreatedTime(node: NodeWithDateCreatedTime | undefined): number {
  return getPreciseDateCreatedTime(node)[0];
}

export {
  attachDateCreatedTime,
  compareDateCreatedTime,
  getDateCreatedTime,
  getPreciseDateCreatedTime,
  parseDateCreatedTime,
  type DateCreatedTime
};
