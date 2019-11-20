import useLanguage from './useLanguage';

import getLocaleString from '../Localization/getLocaleString';

export default function useLocalizeDate(date) {
  const [language] = useLanguage();

  return getLocaleString(date, language);
}
