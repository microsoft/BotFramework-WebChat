import { useMemo } from 'react';

import getRTLList from '../Localization/getRTLList';
import useDirFromProps from './internal/useDirFromProps';
import useLanguage from './useLanguage';

function determineDirection(dir, language) {
  if (dir !== 'auto') {
    return dir;
  } else if (getRTLList().includes(language)) {
    return 'rtl';
  }

  return 'ltr';
}

export default function useDirection() {
  const [dir] = useDirFromProps();
  const [language] = useLanguage();
  const determinedDirection = useMemo(() => determineDirection(dir, language), [dir, language]);

  return [determinedDirection];
}
