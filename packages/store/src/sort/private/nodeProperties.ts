import { array, boolean, is, number, parse } from 'valibot';
import { nodeSchema, type Node } from '../../node/Node.ts';
import type { Identifier } from '../../node/NodeIdentifier.ts';

const booleanValuesSchema = array(boolean());
const numberValuesSchema = array(number());

function getBoolean(node: Node | undefined, property: string): boolean {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[property];

  return is(booleanValuesSchema, values) && values[0] === true;
}

function getNumber(node: Node | undefined, property: string): number | undefined {
  // eslint-disable-next-line security/detect-object-injection
  const values = node?.[property];

  return is(numberValuesSchema, values) ? values[0] : undefined;
}

/** In the ordering tree, a node is part of at most one parent. */
function getParentId(node: Node | undefined): Identifier | undefined {
  const [parent] = node?.isPartOf ?? [];

  return parent?.['@id'];
}

function hasType(node: Node | undefined, type: string): boolean {
  return !!node?.['@type'].has(type);
}

function toNumberValues(value: number | undefined): readonly number[] | undefined {
  return typeof value === 'undefined' ? undefined : Object.freeze([value]);
}

/**
 * Returns a copy of the node with the properties set. `undefined` and empty values remove the property, as the store
 * treats them as removed.
 */
function withProperties(node: Node, properties: Readonly<Record<string, unknown>>): Node {
  const nextNode: Record<string, unknown> = { ...node };

  for (const [key, value] of Object.entries(properties)) {
    if (
      typeof value === 'undefined' ||
      (Array.isArray(value) && !value.length) ||
      (value instanceof Set && !value.size)
    ) {
      // eslint-disable-next-line security/detect-object-injection
      delete nextNode[key];
    } else {
      // eslint-disable-next-line security/detect-object-injection
      nextNode[key] = value;
    }
  }

  return parse(nodeSchema, nextNode);
}

export { getBoolean, getNumber, getParentId, hasType, toNumberValues, withProperties };
