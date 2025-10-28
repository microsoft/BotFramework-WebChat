import type { FlattenedNodeObject } from './FlattenedNodeObject';

export default function isOfType(nodeObject: FlattenedNodeObject, type: string): boolean {
  const types = nodeObject['@type'];

  return typeof types === 'string' ? types === type : !!types && types.includes(type);
}
