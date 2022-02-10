import type { DirectLineActivity } from 'botframework-webchat-core';

import useActivityKeyerContext from './private/useContext';

export default function useGetActivityByKey(): (key?: string) => DirectLineActivity | undefined {
  return useActivityKeyerContext().getActivityByKey;
}
