import { brand, pipe, type InferOutput } from 'valibot';
import { nodeSchema } from '../node/Node.ts';

// Not exported, so the brand cannot be forged outside of this module, unlike a string brand name.
const frozenInternalNodeBrand = Symbol('FrozenInternalNode');

/**
 * Schema of the node stored in the graph, i.e. the "internal version" of the node.
 *
 * It looks the same as `Node`, but it is deeply frozen and has hidden state attached (e.g. cached `dateCreated`
 * and sorted children). The brand is type-only, it differentiates it from the "external version" which could be
 * created by anyone, so internal functions relying on hidden state will only accept nodes frozen by `commitDraft()`.
 *
 * `FrozenInternalNode` is assignable to `Node`, but `Node` is not assignable to `FrozenInternalNode`.
 */
const frozenInternalNodeSchema = pipe(nodeSchema, brand(frozenInternalNodeBrand));

type FrozenInternalNode = InferOutput<typeof frozenInternalNodeSchema>;

export { frozenInternalNodeSchema, type FrozenInternalNode };
