import type { JSONLinkedDataOutput } from './JSONLinkedData';

export default function isOfType(type: string, thing: JSONLinkedDataOutput): boolean {
  return !!thing && thing['@type'].includes(type);
}
