import { type GraphMiddleware } from '../../Graph2';
import { type SlantNode } from '../../schemas/colorNode';
import type { Identifier } from '../../schemas/Identifier';
import type { AnyNode } from '../SlantGraph';

const terminator: GraphMiddleware<AnyNode, SlantNode> =
  () =>
  () =>
  // "terminator" receives SlantNode instead of AnyNode because prior middleware already did the transformation.
  // @ts-expect-error
  (upsertingNodeMap: Map<Identifier, SlantNode>) =>
    upsertingNodeMap;

export default terminator;
