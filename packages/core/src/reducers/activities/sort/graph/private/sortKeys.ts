import type { GetNode, GraphIdentifier, GraphNode } from '../types';
import {
  HOW_TO_TYPE,
  LIVESTREAM_SESSION_TYPE,
  LOCAL_TIMESTAMP,
  LOGICAL_TIMESTAMP,
  PART_POSITION,
  STREAM_SEQUENCE
} from '../vocabulary';
import { getNumber, hasType } from './nodeProperties';

/** What the insertion sorts compare, read once per node version. */
type SortKey = {
  /** Only for messages: the fallback between 2 messages without logical timestamp. */
  readonly localTimestamp: number | undefined;
  readonly logicalTimestamp: number | undefined;
  readonly partPosition: number | undefined;
  /** The final revision has no sequence number and sorts last. */
  readonly streamSequence: number;
};

/**
 * Sort keys of the parts of a parent, by the (immutable) parts array of the part index. The arrays are carried from
 * state to state, so a parent's keys are read from the nodes once, then spliced as parts move.
 *
 * The keys of an array hold in every state that has the array: when a part's key changes in place (e.g. a HowTo's
 * timestamp), its parent gets a new array (`WorkingGraph.setNode()`, `carrySortKeys()`).
 */
const sortKeysCache = new WeakMap<readonly GraphIdentifier[], readonly SortKey[]>();

function isMessage(node: GraphNode): boolean {
  return !hasType(node, HOW_TO_TYPE) && !hasType(node, LIVESTREAM_SESSION_TYPE);
}

function toSortKey(node: GraphNode): SortKey {
  return Object.freeze({
    localTimestamp: isMessage(node) ? getNumber(node, LOCAL_TIMESTAMP) : undefined,
    logicalTimestamp: getNumber(node, LOGICAL_TIMESTAMP),
    partPosition: getNumber(node, PART_POSITION),
    streamSequence: getNumber(node, STREAM_SEQUENCE) ?? Infinity
  });
}

function hasSameSortKey(x: GraphNode, y: GraphNode): boolean {
  const xKey = toSortKey(x);
  const yKey = toSortKey(y);

  return (
    Object.is(xKey.localTimestamp, yKey.localTimestamp) &&
    Object.is(xKey.logicalTimestamp, yKey.logicalTimestamp) &&
    Object.is(xKey.partPosition, yKey.partPosition) &&
    Object.is(xKey.streamSequence, yKey.streamSequence)
  );
}

function getSortKeys(partIds: readonly GraphIdentifier[], getNode: GetNode): readonly SortKey[] {
  const cachedKeys = sortKeysCache.get(partIds);

  if (cachedKeys) {
    return cachedKeys;
  }

  const keys = Object.freeze(
    partIds.map(partId => {
      const part = getNode(partId);

      if (!part) {
        throw new Error(`botframework-webchat: Cannot find node "${partId}" in the activities graph`);
      }

      return toSortKey(part);
    })
  );

  sortKeysCache.set(partIds, keys);

  return keys;
}

function setSortKeys(partIds: readonly GraphIdentifier[], keys: readonly SortKey[]): void {
  sortKeysCache.set(partIds, Object.freeze(keys));
}

/**
 * `nextPartIds` = `partIds` with the part at `index` changed in place to `part`: carries the cached keys of `partIds` (if
 * any) with that one key replaced, O(n) copy instead of reading every part again.
 */
function carrySortKeys(
  partIds: readonly GraphIdentifier[],
  nextPartIds: readonly GraphIdentifier[],
  index: number,
  part: GraphNode
): void {
  const keys = sortKeysCache.get(partIds);

  if (keys && index >= 0 && index < keys.length) {
    const nextKeys = keys.slice();

    // eslint-disable-next-line security/detect-object-injection
    nextKeys[index] = toSortKey(part);
    sortKeysCache.set(nextPartIds, Object.freeze(nextKeys));
  }
}

export { carrySortKeys, getSortKeys, hasSameSortKey, setSortKeys, toSortKey, type SortKey };
