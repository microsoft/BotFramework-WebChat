import Graph from '../Graph2';
import { type SlantNode } from '../schemas/colorNode';
import type { Identifier } from '../schemas/Identifier';
import assertSlantNode from './private/assertSlantNode';
import autoInversion from './private/autoInversion';
import color from './private/color';

type AnyNode = Record<string, unknown> & {
  readonly '@id': Identifier;
  readonly '@type': string | readonly string[];
};

class SlantGraph extends Graph<AnyNode, SlantNode> {
  constructor() {
    // `autoInversion` must run after `assertSlantNode`.
    super(color, assertSlantNode, autoInversion);
  }
}

export default SlantGraph;

export { type AnyNode };
