import useLanguage from './useLanguage';
import useMemo from 'react';

import { localize } from '../Localization/Localize';

export default function useLocalize(text, ...args) {
  const [language] = useLanguage();

  return useMemo(() => localize(text, language, ...args), [language, text, ...args]);
}
