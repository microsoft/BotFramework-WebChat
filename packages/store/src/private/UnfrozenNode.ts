import { brand, pipe, type InferOutput } from 'valibot';
import { nodeSchema } from '../node/Node.ts';

/**
 * Schema of a validated node which is not frozen yet, i.e. created by `createNode()` and before `freezeNode()`.
 *
 * It looks the same as `InternalNode`, all property values are deeply frozen, but the node object itself is not frozen,
 * so `hasPart` and `isPartOf` could be set in place without copying the node. The brand is type-only, it prevents an
 * unfrozen node from being stored in the graph, as `UnfrozenNode` is not assignable to `InternalNode`.
 *
 * An unfrozen node is owned by a single draft, it must never be exposed to userland.
 */
const unfrozenNodeSchema = pipe(nodeSchema, brand('UnfrozenNode'));

type UnfrozenNode = InferOutput<typeof unfrozenNodeSchema>;

export { unfrozenNodeSchema, type UnfrozenNode };
