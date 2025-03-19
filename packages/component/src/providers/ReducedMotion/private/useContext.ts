import { useContext as useReactContext } from 'react';

import { type ContextOf } from '../../../types/ContextOf';
import Context from './Context';

export default function useContext(): ContextOf<typeof Context> {
  return useReactContext(Context);
}
