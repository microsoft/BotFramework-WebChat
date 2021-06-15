import useLanguage from './useLanguage';

import getLocaleString from '../localization/getLocaleString';

let deprecationNotesShown;

/** @deprecated Please use useDateFormatter() instead. */
export default function useLocalizeDate(date: Date | number | string): string {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: useLocalizeDate() is deprecated. Please use the useDateFormatter() hooks instead. This hook will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  const [language] = useLanguage();

  return getLocaleString(date, language);
}
