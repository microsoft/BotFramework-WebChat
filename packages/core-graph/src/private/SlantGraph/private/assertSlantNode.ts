import { assert, type BaseSchema } from 'valibot';
import { type GraphMiddleware } from '../../Graph2';
import { SlantNodeSchema, type SlantNode } from '../../schemas/colorNode';
import { DirectLineActivityNodeSchema } from '../../schemas/DirectLineActivityNode';
import isOfType from '../../schemas/isOfType';
import { MessageNodeSchema } from '../../schemas/MessageNode';
import { type AnyNode } from '../SlantGraph';

const VALIDATION_SCHEMAS_BY_TYPE = new Map<string, BaseSchema<unknown, unknown, any>>([
  ['Message', MessageNodeSchema],
  ['urn:microsoft:webchat:direct-line-activity', DirectLineActivityNodeSchema]
]);

const assertSlantNode: GraphMiddleware<AnyNode, SlantNode> = () => next => upsertingNodeMap => {
  for (const node of upsertingNodeMap.values()) {
    assert(SlantNodeSchema, node);

    for (const [type, schema] of VALIDATION_SCHEMAS_BY_TYPE) {
      isOfType(node, type) && assert(schema, node);
    }
  }

  return next(upsertingNodeMap);
};

export default assertSlantNode;
