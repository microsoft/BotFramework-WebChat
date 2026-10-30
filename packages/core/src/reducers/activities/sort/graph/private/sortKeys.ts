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

/** Call when a part's sort key changed in place (e.g. a HowTo's timestamp), so its parent's keys are read again. */
function forgetSortKeys(partIds: readonly GraphIdentifier[]): void {
  sortKeysCache.delete(partIds);
}

export { forgetSortKeys, getSortKeys, hasSameSortKey, setSortKeys, toSortKey, type SortKey };
