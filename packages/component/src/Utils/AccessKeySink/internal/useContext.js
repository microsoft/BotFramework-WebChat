import { useContext } from 'react';

import AccessKeySinkContext from './Context';

export default function useAccessKeySinkContext() {
  return useContext(AccessKeySinkContext);
}
