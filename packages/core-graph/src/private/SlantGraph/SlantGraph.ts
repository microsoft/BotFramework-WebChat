import Graph from '../Graph';
import { type SlantNode } from '../schemas/colorNode';
import type { Identifier } from '../schemas/Identifier';
import assertSlantNode from './private/assertSlantNode';
import autoInversion from './private/autoInversion';
import color from './private/color';
import terminator from './private/terminator';

type AnyNode = Record<string, unknown> & {
  readonly '@id': Identifier;
  readonly '@type': string | readonly string[];
};

class SlantGraph extends Graph<AnyNode, SlantNode> {
  constructor() {
    // `autoInversion` and `terminator` must run after `assertSlantNode` as they assume all input are validated `SlantNode`.
    super(color, assertSlantNode, autoInversion, terminator);
  }
}

export default SlantGraph;

export { type AnyNode };
