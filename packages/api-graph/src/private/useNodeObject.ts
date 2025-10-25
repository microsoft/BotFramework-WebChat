import { useGraphContext } from './GraphContext';
import type { Identifier } from './schemas/Identifier';
import type { NodeObject } from './schemas/NodeObject';

// Related to https://www.w3.org/TR/json-ld11/#node-objects.
export default function useNodeObject(id: Identifier): NodeObject | undefined {
  const { objects } = useGraphContext();

  return objects.get(id);
}
