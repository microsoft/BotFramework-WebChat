import { type BlankNode } from './BlankNode';
import isBlankNode from './isBlankNode';

/**
 * An unconnected blank node is a blank node without any edge or properties.
 *
 * @see https://json-ld.github.io/json-ld.org/spec/latest/json-ld/#data-model
 * @param object A blank node.
 * @returns `true`, if the blank node is unconnected, otherwise, `false`.
 */
export default function isUnconnectedBlankNode<T extends BlankNode>(object: T): boolean {
  return isBlankNode(object) && Object.getOwnPropertyNames(object).every(name => name.startsWith('@'));
}
