import useActiveDescendantContext from './private/useContext';

import type { ActiveDescendantIdSetter } from './private/Context';

export default function useActiveDescendantId(): [string, ActiveDescendantIdSetter] {
  const { activeDescendantId, setActiveDescendantId } = useActiveDescendantContext();

  return [activeDescendantId, setActiveDescendantId];
}
