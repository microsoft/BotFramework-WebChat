import { useContext as useReactContext } from 'react';

import Context from './Context';

export default function useContext() {
  return useReactContext(Context);
}
