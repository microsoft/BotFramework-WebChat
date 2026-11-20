import { brand, pipe, type InferOutput } from 'valibot';
import { nodeSchema } from '../node/Node.ts';

/**
 * Schema of a validated node which is not frozen yet, i.e. created by `createNode()` and before `freezeNode()`.
 *
 * It looks the same as `FrozenInternalNode`, all property values are deeply frozen, but the node object itself is not
 * frozen, so `hasPart` and `isPartOf` could be set in place without copying the node. The brand is type-only, it
 * prevents an unfrozen node from being stored in the graph, as `UnfrozenInternalNode` is not assignable to
 * `FrozenInternalNode`.
 *
 * An unfrozen node is owned by a single draft, it must never be exposed to userland.
 */
const unfrozenInternalNodeSchema = pipe(nodeSchema, brand('UnfrozenInternalNode'));

type UnfrozenInternalNode = InferOutput<typeof unfrozenInternalNodeSchema>;

export { unfrozenInternalNodeSchema, type UnfrozenInternalNode };
