import type { FlatNodeObject } from './FlatNodeObject';

export default function isOfType(nodeObject: FlatNodeObject, type: string): boolean {
  const types = nodeObject['@type'];

  return typeof types === 'string' ? types === type : !!types && types.includes(type);
}
