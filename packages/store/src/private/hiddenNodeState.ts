import type { NodeIdentifier } from '../node/NodeIdentifier.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';

type HiddenNodeStateInit = {
  /** `dateCreated` as epoch time, `Infinity` if not set, see `parseDateCreatedTime()`. */
  readonly dateCreatedTime: number;
  /** IDs of children sorted by `dateCreated`, then `@id`, `undefined` if the node has no children. */
  readonly sortedChildIds: FrozenSkipList<NodeIdentifier> | undefined;
};

/** Returns the object passed in, so the subclass can attach private fields to a plain object. */
class Stamp {
  constructor(target: object) {
    return target;
  }
}

/**
 * Hidden state attached to a plain node object as private fields, without changing its class, shape seen by userland,
 * or enumerable properties.
 *
 * - Private fields are invisible to userland: `Object.keys()`, spread, `JSON.stringify()`, `Reflect.ownKeys()`, etc.
 * - A copy made by userland (e.g. spread or `JSON.parse(JSON.stringify())`) does not have the hidden state, getters
 *   rebuild it on demand where possible, e.g. `getDateCreatedTime()` parses `dateCreated`
 * - It is faster than a non-enumerable symbol property to attach and to read, see `npm run benchmark:node`
 * - Must be stamped before the node is frozen
 */
class HiddenNodeState extends Stamp {
  constructor(target: object, { dateCreatedTime, sortedChildIds }: HiddenNodeStateInit) {
    super(target);

    this.#dateCreatedTime = dateCreatedTime;
    this.#sortedChildIds = sortedChildIds;
  }

  readonly #dateCreatedTime: number;
  readonly #sortedChildIds: FrozenSkipList<NodeIdentifier> | undefined;

  static getDateCreatedTime(node: object): number | undefined {
    return #dateCreatedTime in node ? node.#dateCreatedTime : undefined;
  }

  static getSortedChildIds(node: object): FrozenSkipList<NodeIdentifier> | undefined {
    return #sortedChildIds in node ? node.#sortedChildIds : undefined;
  }

  static isStamped(node: object): node is HiddenNodeState {
    return #dateCreatedTime in node;
  }
}

Object.freeze(HiddenNodeState.prototype);
Object.freeze(HiddenNodeState);
Object.freeze(Stamp.prototype);
Object.freeze(Stamp);

/**
 * Parses `dateCreated` (ISO timestamp string) as `Date` and returns its epoch time, `Infinity` if not set.
 *
 * ISO timestamps with different time zones (e.g. `+02:00` and `Z`) cannot be compared as string.
 *
 * Sub-millisecond digits are dropped (truncated, not rounded), as `Date` does. Children with `dateCreated` within the
 * same millisecond are sorted by `@id`. The original `dateCreated` string is kept as-is.
 */
function parseDateCreatedTime(dateCreated: unknown): number {
  // eslint-disable-next-line no-restricted-globals
  return typeof dateCreated === 'string' ? new Date(dateCreated).getTime() : Infinity;
}

/**
 * Attaches hidden state to the node. The node must not be frozen and must not be stamped yet.
 */
function stampHiddenNodeState<T extends object>(node: T, init: HiddenNodeStateInit): T {
  if (Object.isFrozen(node) || HiddenNodeState.isStamped(node)) {
    throw new Error('ASSERTION: Node must not be frozen or stamped before stamping hidden state');
  }

  // Constructing is used for its side effect of attaching private fields, the returned object is the node itself.
  return new HiddenNodeState(node, init) satisfies object as T;
}

/**
 * Gets `dateCreated` of the node as epoch time, `Infinity` if not set or the node is `undefined`.
 *
 * The cached value is returned if the node is stamped, otherwise, `dateCreated` is parsed.
 */
function getDateCreatedTime(node: object | undefined): number {
  return node
    ? (HiddenNodeState.getDateCreatedTime(node) ?? parseDateCreatedTime(Reflect.get(node, 'dateCreated')))
    : Infinity;
}

/**
 * Gets IDs of children sorted by `dateCreated`, then `@id`. Returns `undefined` if the node has no children or is not
 * stamped (sorted children cannot be rebuilt from the node alone).
 */
function getSortedChildIds(node: object | undefined): FrozenSkipList<NodeIdentifier> | undefined {
  return node && HiddenNodeState.getSortedChildIds(node);
}

export { getDateCreatedTime, getSortedChildIds, stampHiddenNodeState };
