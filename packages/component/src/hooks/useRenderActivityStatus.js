import { useCallback, useContext } from 'react';

import useGroupTimestamp from './useGroupTimestamp';
import WebChatUIContext from '../WebChatUIContext';

export default function useRenderActivityStatus() {
  const { activityStatusRenderer } = useContext(WebChatUIContext);
  const [groupTimestamp] = useGroupTimestamp();

  return useCallback(arg => activityStatusRenderer({ groupTimestamp, ...arg }), [
    activityStatusRenderer,
    groupTimestamp
  ]);
}
