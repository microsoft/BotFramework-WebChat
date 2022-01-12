import type { DirectLineActivity } from 'botframework-webchat-core';

import useActivityKeyerContext from './private/useContext';

export default function useGetActivityByKey(): (key: string) => DirectLineActivity {
  return useActivityKeyerContext().getActivityByKey;
}
