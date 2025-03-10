import { useContext as useReactContext } from 'react';

import Context from './Context';

import { type ContextOf } from '../../../types/ContextOf';

export default function useContext(): ContextOf<typeof Context> {
  return useReactContext(Context);
}
