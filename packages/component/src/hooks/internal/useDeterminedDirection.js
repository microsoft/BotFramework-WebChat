import getRTLList from '../../Localization/getRTLList';
import useLanguage from '../useLanguage';
import { useMemo } from 'react';

function determineDirection(dir, language) {
  if (dir === 'auto') {
    const RTLList = getRTLList();

    if (RTLList.includes(language)) {
      return 'rtl';
    }
    return 'ltr';
  }
  return dir;
}

export default function useDeterminedDirection(dir) {
  const [language] = useLanguage();
  const determinedDirection = useMemo(() => determineDirection(dir, language), [dir, language]);

  return determinedDirection;
}
