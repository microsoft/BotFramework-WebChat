import { useCallback } from 'react';

import getLocaleString from '../Localization/getLocaleString';
import useLanguage from './useLanguage';

export default function useDateFormatter() {
  const [language] = useLanguage();

  return useCallback(date => getLocaleString(date, language), [language]);
}
