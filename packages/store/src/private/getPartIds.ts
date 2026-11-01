import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import createReadonlySet from './createReadonlySet.ts';

type PartProperty = 'hasPart' | 'isPartOf';

type PartIdsCacheEntry = {
  readonly ids: ReadonlySet<Identifier>;
  /** The `hasPart`/`isPartOf` property value which `ids` is built from. */
  readonly source: Node[PartProperty];
};

type PartIdsCache = {
  hasPart: PartIdsCacheEntry | undefined;
  isPartOf: PartIdsCacheEntry | undefined;
};

const EMPTY_PART_IDS: ReadonlySet<Identifier> = createReadonlySet<Identifier>([]);

// Hidden property on the node to cache the IDs in the `hasPart` and `isPartOf` property.
const partIdsCacheSymbol = Symbol('partIdsCache');

type NodeWithPartIdsCache = Node & { readonly [partIdsCacheSymbol]?: PartIdsCache | undefined };

/**
 * Returns a frozen copy of a deeply frozen node, with an empty cache of part IDs in a hidden (non-enumerable) property.
 *
 * The node is frozen and cannot be modified later, so the cache holder must be attached up front. The cache is filled
 * lazily by `getPartIds()`.
 */
function attachPartIdsCache(node: Node): Node {
  return Object.freeze(
    Object.defineProperty({ ...node }, partIdsCacheSymbol, {
      // Not enumerable: hidden from spread, `Object.entries()`, `JSON.stringify()`, and deep equality checks.
      value: Object.seal({ hasPart: undefined, isPartOf: undefined } satisfies PartIdsCache)
    })
  );
}

/**
 * Gets IDs of nodes in the `hasPart` or `isPartOf` property. The returned `Set` is read-only.
 *
 * The IDs are built in O(k) on first call and cached in the node. As `hasPart` and `isPartOf` are immutable, subsequent
 * calls return the cached IDs in O(1) if the property value is the same reference as the one the cache is built from.
 */
function getPartIds(node: NodeWithPartIdsCache | undefined, property: PartProperty): ReadonlySet<Identifier> {
  const source = property === 'hasPart' ? node?.hasPart : node?.isPartOf;

  if (!node || !source?.size) {
    return EMPTY_PART_IDS;
  }

  // eslint-disable-next-line security/detect-object-injection
  const cache = node[partIdsCacheSymbol];
  const entry = property === 'hasPart' ? cache?.hasPart : cache?.isPartOf;

  if (entry?.source === source) {
    return entry.ids;
  }

  const ids = createReadonlySet(Array.from(source, ({ '@id': id }) => id));

  if (cache) {
    const nextEntry = Object.freeze({ ids, source } satisfies PartIdsCacheEntry);

    property === 'hasPart' ? (cache.hasPart = nextEntry) : (cache.isPartOf = nextEntry);
  }

  return ids;
}

export default getPartIds;
export { attachPartIdsCache };
export type { PartProperty };
