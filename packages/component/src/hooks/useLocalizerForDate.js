import { useCallback } from 'react';

import getLocaleString from '../Localization/getLocaleString';
import useLanguage from './useLanguage';

export default function useLocalizerForDate() {
  const [language] = useLanguage();

  return useCallback(date => getLocaleString(date, language), [language]);
}
