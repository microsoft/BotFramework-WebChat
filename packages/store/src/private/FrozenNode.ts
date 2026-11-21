import { brand, pipe, type InferOutput } from 'valibot';
import { nodeSchema } from '../node/Node.ts';

// Not exported, so the brand cannot be forged outside of this module, unlike a string brand name.
const frozenNodeBrand = Symbol('FrozenNode');

/**
 * Schema of the node stored in the graph, i.e. the "internal version" of the node.
 *
 * It looks the same as `Node`, but it is deeply frozen and has hidden state attached (e.g. cached `dateCreated`
 * and sorted children). The brand is type-only, it differentiates it from the "external version" which could be
 * created by anyone, so internal functions relying on hidden state will only accept nodes frozen by `commitDraft()`.
 *
 * `FrozenNode` is assignable to `Node`, but `Node` is not assignable to `FrozenNode`.
 */
const frozenNodeSchema = pipe(nodeSchema, brand(frozenNodeBrand));

type FrozenNode = InferOutput<typeof frozenNodeSchema>;

export { frozenNodeSchema, type FrozenNode };
