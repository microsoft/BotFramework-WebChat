import { useGraphContext } from './GraphContext';
import type { MessageNode } from '@msinternal/botframework-webchat-core-graph';

export default function useOrderedMessageNodes(): readonly [readonly MessageNode[]] {
  return useGraphContext().orderedMessageNodesState;
}
