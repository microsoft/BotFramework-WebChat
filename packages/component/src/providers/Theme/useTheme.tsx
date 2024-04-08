import { useContext } from 'react';

import Context from './private/Context';

export default function useTheme() {
  return useContext(Context);
}
