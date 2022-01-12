import { useContext } from 'react';

import ActivityKeyerContext from './Context';

export default function useActivityKeyerContext() {
  return useContext(ActivityKeyerContext);
}
