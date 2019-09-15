import useLanguage from './useLanguage';

import { localize } from '../Localization/Localize';

export default function useLocalize(text, ...args) {
  const [language] = useLanguage();

  return localize(text, language, ...args);
}
