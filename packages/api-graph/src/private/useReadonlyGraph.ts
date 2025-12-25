import type { Identifier, SlantNode } from '@msinternal/botframework-webchat-core-graph';
import { useGraphContext } from './GraphContext';

export default function useReadonlyGraph(): readonly [ReadonlyMap<Identifier, SlantNode>] {
  return useGraphContext().readonlyGraphState;
}
