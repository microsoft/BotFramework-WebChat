import useLanguage from './useLanguage';

import getLocaleString from '../Localization/getLocaleString';

let deprecationNotesShown;

export default function useLocalizeDate(date) {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: useLocalizeDate() is deprecated. Please use the useDateFormatter() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  const [language] = useLanguage();

  return getLocaleString(date, language);
}
