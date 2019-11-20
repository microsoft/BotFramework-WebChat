import useLanguage from './useLanguage';

import { localize } from '../Localization/Localize';

export default function useLocalize(text, ...args) {
  const [language] = useLanguage();

  // TODO: [P3] Use useMemo to cache the result.
  return localize(text, language, ...args);
}
