import { useEffect, useRef } from 'react';
import useContext from './private/useContext';

import type { MutableRefObject } from 'react';

export default function useItemRef<T extends HTMLElement>(itemIndex: number): MutableRefObject<T | null> {
  const ref = useRef<T>(null);

  const { itemEffector } = useContext();

  useEffect(() => {
    itemEffector(ref, itemIndex);
  });

  return ref;
}
