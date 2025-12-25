import { useGraphContext } from './GraphContext';
import type { DirectLineActivityNode } from '@msinternal/botframework-webchat-core-graph';

export default function useOrderedMessageNodes(): readonly [readonly DirectLineActivityNode[]] {
  return useGraphContext().orderedMessageNodesState;
}
