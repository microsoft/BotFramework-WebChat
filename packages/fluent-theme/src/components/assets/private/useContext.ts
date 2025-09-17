import { useContext as useReactContext } from 'react';

import Context, { ContextType } from './Context';

export default function useContext(): ContextType {
  return useReactContext(Context);
}
