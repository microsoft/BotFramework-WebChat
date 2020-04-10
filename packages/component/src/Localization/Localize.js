// Localize is designed to be elaboratively return multiple results and possibly exceeding complexity requirement
/* eslint complexity: "off" */

import deprecatingGetLocaleString from './getLocaleString';
import getAllLocalizedStrings from './getAllLocalizedStrings';
import getRTLList from './getRTLList';
import normalizeLanguage from '../Utils/normalizeLanguage';
import useLocalizer from '../hooks/useLocalizer';

let deprecationNotesShown;

function localize(id, language, ...args) {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: localize() is deprecated. Please use the useLocalizer() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  const allStrings = getAllLocalizedStrings();
  const normalizedLanguage = normalizeLanguage(language);
  const localizedStrings = allStrings[normalizedLanguage];

  return Object.entries(args).reduce(
    (str, [index, arg]) => str.replace(`$${+index + 1}`, arg),
    (localizedStrings && localizedStrings[id]) || allStrings['en-US'][id] || ''
  );
}

function getLocaleString(...args) {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: localize() is deprecated. Please use the useLocalizer() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  return deprecatingGetLocaleString(...args);
}

export default ({ args, text }) => {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: <Localize> is deprecated. Please use the useLocalizer() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  return useLocalizer()(text, ...(args || []));
};

export { getLocaleString, getRTLList, localize };
