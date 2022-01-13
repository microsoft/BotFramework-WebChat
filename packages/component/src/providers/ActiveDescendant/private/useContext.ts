import { useContext } from 'react';

import ActiveDescendantContext from './Context';

export default function useActiveDescendantContext() {
  return useContext(ActiveDescendantContext);
}
