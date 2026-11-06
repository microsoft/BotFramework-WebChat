import type { InternalNode } from './InternalNode.ts';

// Hidden property on the node to cache the parsed `dateCreated` as epoch time, so sorting does not parse it on every
// comparison. A number is cached instead of a `Date` object because `Date` is mutable.
const dateCreatedTimeSymbol = Symbol('dateCreatedTime');

type NodeWithDateCreatedTime = InternalNode & { readonly [dateCreatedTimeSymbol]?: number | undefined };

/**
 * Parses `dateCreated` (ISO timestamp string) as `Date` and returns its epoch time, `Infinity` if not set.
 *
 * ISO timestamps with different time zones (e.g. `+02:00` and `Z`) cannot be compared as string.
 */
function parseDateCreatedTime(dateCreated: string | undefined): number {
  return typeof dateCreated === 'string' ? new Date(dateCreated).getTime() : Infinity;
}

/**
 * Caches the parsed `dateCreated` on the node as a hidden non-enumerable property. The node must not be frozen yet.
 */
function attachDateCreatedTime<T extends object>(node: T, time: number): T {
  return Object.defineProperty(node, dateCreatedTimeSymbol, { value: time });
}

/**
 * Gets the cached `dateCreated` as epoch time, `Infinity` if not set.
 *
 * Only `InternalNode` (created by `createNode()` or `attachHasPart()`) has the cache, so it is not parsed again.
 */
function getDateCreatedTime(node: NodeWithDateCreatedTime | undefined): number {
  // eslint-disable-next-line security/detect-object-injection
  return node?.[dateCreatedTimeSymbol] ?? Infinity;
}

export { attachDateCreatedTime, getDateCreatedTime, parseDateCreatedTime };
