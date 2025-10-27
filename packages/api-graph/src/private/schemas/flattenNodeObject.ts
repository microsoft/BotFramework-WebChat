import { object, optional, parse, safeParse } from 'valibot';
import type { FlattenedNodeObject, FlattenedNodeObjectPropertyValue } from './FlattenedNodeObject';
import flattenedNodeObject from './FlattenedNodeObject';
import identifier from './Identifier';
import { literal, type Literal } from './Literal';
import { nodeReference, type NodeReference } from './NodeReference';

function flattenNodeObject_<T extends Literal>(
  input: T,
  graphMap: Map<string, FlattenedNodeObject>,
  refMap: Map<object, NodeReference>
): T;

function flattenNodeObject_(
  input: object,
  graphMap: Map<string, FlattenedNodeObject>,
  refMap: Map<object, NodeReference>
): NodeReference;

function flattenNodeObject_(
  input: Literal | object,
  graphMap: Map<string, FlattenedNodeObject>,
  refMap: Map<object, NodeReference>
): Literal | NodeReference;

function flattenNodeObject_(
  input: Literal | object,
  graphMap: Map<string, FlattenedNodeObject>,
  refMap: Map<object, NodeReference>
): Literal | NodeReference {
  const parseAsLiteralResult = safeParse(literal(), input);

  if (parseAsLiteralResult.success) {
    return parseAsLiteralResult.output;
  }

  // This is for TypeScript only because safeParse().success is not a type predicate.
  input = input as object;

  if (!safeParse(object({}), input).success) {
    const error = new Error('Only JSON-LD literal and plain object can be flattened');

    error.cause = { input };

    throw error;
  }

  const existingNodeReference = refMap.get(input);

  if (existingNodeReference) {
    return existingNodeReference;
  }

  const id =
    parse(
      optional(identifier()),
      (input && typeof input === 'object' && '@id' in input && input['@id']) || undefined
    ) ?? `_:${crypto.randomUUID()}`;

  if (graphMap.get(id)) {
    console.warn(`Object [@id="${id}"] has already added to the graph.`);
  }

  // We want to reserve the top position for root object. We will set it later.
  // @ts-expect-error
  graphMap.set(id, undefined);

  const targetMap = new Map<string, FlattenedNodeObjectPropertyValue>();

  for (const [key, value] of Object.entries(input)) {
    let parsedValue: FlattenedNodeObjectPropertyValue;

    if (Array.isArray(value)) {
      const resultArray: (Literal | NodeReference)[] = [];

      for (const element of value) {
        resultArray.push(flattenNodeObject_(element, graphMap, refMap));
      }

      parsedValue = Object.freeze(resultArray);
    } else {
      parsedValue = flattenNodeObject_(value, graphMap, refMap);
    }

    targetMap.set(key, parsedValue);
  }

  // const id = parse(optional(identifier()), targetMap.get('@id')) ?? `_:${crypto.randomUUID()}`;

  targetMap.set('@id', id);

  const output: FlattenedNodeObject = parse(flattenedNodeObject(), Object.fromEntries(Array.from(targetMap)));
  const nodeRef = parse(nodeReference(), Object.freeze({ '@id': id }));

  graphMap.set(id, output);
  refMap.set(input, nodeRef);

  return nodeRef;
}

export default function flattenNodeObject(input: object): {
  readonly graph: readonly FlattenedNodeObject[];
  readonly output: NodeReference;
} {
  parse(object({}), input);

  const graph = new Map<string, FlattenedNodeObject>();
  const refMap = new Map<object, NodeReference>();
  const output = flattenNodeObject_(input, graph, refMap);

  return { graph: Object.freeze(Array.from(graph.values())), output };
}
