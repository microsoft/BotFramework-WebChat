import { object, optional, parse, safeParse } from 'valibot';

import flatNodeObject, { type FlatNodeObject, type FlatNodeObjectPropertyValue } from './FlatNodeObject';
import identifier from './Identifier';
import { literal, type Literal } from './Literal';
import { nodeReference, type NodeReference } from './NodeReference';

type FlattenNodeObjectInput = Literal | (object & { '@id'?: string });

function flattenNodeObject_<T extends Literal>(
  input: T,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): T;

function flattenNodeObject_(
  input: FlattenNodeObjectInput,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): NodeReference;

function flattenNodeObject_(
  input: FlattenNodeObjectInput | Literal,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): Literal | NodeReference;

function flattenNodeObject_(
  input: FlattenNodeObjectInput | Literal,
  graphMap: Map<string, FlatNodeObject>,
  refMap: Map<FlattenNodeObjectInput, NodeReference>
): Literal | NodeReference {
  const parseAsLiteralResult = safeParse(literal(), input);

  if (parseAsLiteralResult.success) {
    return parseAsLiteralResult.output;
  }

  // This is for TypeScript only because safeParse().success is not a type predicate.
  input = input as object;

  // Array is allowed by valibot.object({}), we need to check for plain object first.
  if (Object.prototype.toString.call(input) !== '[object Object]' || !safeParse(object({}), input).success) {
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

  const targetMap = new Map<string, FlatNodeObjectPropertyValue>();

  for (const [key, value] of Object.entries(input)) {
    let parsedValue: FlatNodeObjectPropertyValue;

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

  const output: FlatNodeObject = parse(flatNodeObject(), Object.fromEntries(Array.from(targetMap)));
  const nodeRef = parse(nodeReference(), Object.freeze({ '@id': id }));

  graphMap.set(id, output);
  refMap.set(input, nodeRef);

  return nodeRef;
}

type FlattenNodeObjectReturnValue = {
  /** A graph consists of one or more objects. */
  readonly graph: readonly FlatNodeObject[];
  /** A node reference object of the input. */
  readonly output: NodeReference;
};

/**
 * Flattens a node object into a graph of one or more objects.
 *
 * The output graph is JSON-LD compliant, however, it is not strictly flattened.
 *
 * Notes:
 *
 * - All nodes has `@id` and are linked without orphans.
 * - Does not completely strictly follow JSON-LD flattening strategy.
 *    - The result is parseable as JSON-LD, just not "perfectly flattened JSON-LD".
 * - Does not support every syntax in JSON-LD, such as `@value`.
 * - Node references are *not* flattened to string such as `"_:b1"`, instead, it will be kept as `{ "@id": "_:b1" }`
 *
 * @param input Boolean, number, null, string, or plain object with or without `@id`.
 * @returns {FlattenNodeObjectReturnValue} A graph and a node reference.
 */
function flattenNodeObject(input: FlattenNodeObjectInput): FlattenNodeObjectReturnValue {
  parse(object({}), input);

  const graph = new Map<string, FlatNodeObject>();
  const refMap = new Map<object, NodeReference>();
  const output = flattenNodeObject_(input, graph, refMap);

  return { graph: Object.freeze(Array.from(graph.values())), output };
}

export default flattenNodeObject;
export { type FlattenNodeObjectInput, type FlattenNodeObjectReturnValue };
