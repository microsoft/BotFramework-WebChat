import { type BlankNode } from './BlankNode';

/**
 * A blank node is a node with `@id` starting with `"_:"`
 *
 * @see https://json-ld.github.io/json-ld.org/spec/latest/json-ld/#dfn-blank-nodes
 * @param node A node.
 * @returns `true`, if the node is a blank node, otherwise, `false`.
 */
export default function isBlankNode(node: unknown): node is BlankNode {
  // TODO: Do we restrict to plain object or just anything?
  if (node) {
    const id = node['@id'];

    return typeof id === 'string' && id.startsWith('_:');
  }

  return false;
}
