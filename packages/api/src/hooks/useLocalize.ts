import useLanguage from './useLanguage';

import { localize } from '../localization/Localize';

// TODO: Remove on or after 2022-02-12.
/** @deprecated Please use "useLocalizer" instead. */
export default function useLocalize(text: string, ...args: string[]): boolean | string {
  const [language] = useLanguage();

  // TODO: [P3] Use useMemo to cache the result.
  return localize(text, language, ...args);
}
