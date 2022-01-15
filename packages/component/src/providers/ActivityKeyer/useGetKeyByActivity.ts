import type { DirectLineActivity } from 'botframework-webchat-core';

import useActivityKeyerContext from './private/useContext';

export default function useGetKeyByActivity(): (activity?: DirectLineActivity) => string | undefined {
  return useActivityKeyerContext().getKeyByActivity;
}
