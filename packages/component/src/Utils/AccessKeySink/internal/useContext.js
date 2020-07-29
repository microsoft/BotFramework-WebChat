import { useContext } from 'react';

import Context from './Context';

export default function useAccessKeySinkContext() {
  return useContext(Context);
}
