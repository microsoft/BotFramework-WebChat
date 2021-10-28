// Localize is designed to be elaboratively return multiple results and possibly exceeding complexity requirement
/* eslint complexity: "off" */

import { isForbiddenPropertyName } from 'botframework-webchat-core';

import deprecatingGetLocaleString from './getLocaleString';
import getAllLocalizedStrings from './getAllLocalizedStrings';
import getRTLList from './getRTLList';
import normalizeLanguage from '../utils/normalizeLanguage';
import useLocalizer from '../hooks/useLocalizer';

let deprecationNotesShown;

function localize(id: string, language: string, ...args: string[]) {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: localize() is deprecated. Please use the useLocalizer() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  const allStrings = getAllLocalizedStrings();
  const normalizedLanguage = normalizeLanguage(language);

  // Mitigation through denylisting.
  // eslint-disable-next-line security/detect-object-injection
  const localizedStrings = isForbiddenPropertyName(language) ? undefined : allStrings[normalizedLanguage];

  return Object.entries(args).reduce<boolean | string>(
    (value, [index, arg]) => (typeof value === 'string' ? value.replace(`$${+index + 1}`, arg) : value),
    // Mitigation through denylisting.
    // eslint-disable-next-line security/detect-object-injection
    isForbiddenPropertyName(id) ? '' : (localizedStrings && localizedStrings[id]) || allStrings['en-US'][id] || ''
  );
}

function getLocaleString(date: Date | number | string, language: string) {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: localize() is deprecated. Please use the useLocalizer() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  return deprecatingGetLocaleString(date, language);
}

export default ({ args, text }: { args: [(number | string)?, ...string[]]; text: string | any }) => {
  if (!deprecationNotesShown) {
    console.warn(
      'botframework-webchat: <Localize> is deprecated. Please use the useLocalizer() hooks instead. This function will be removed on or after 2022-02-12.'
    );

    deprecationNotesShown = true;
  }

  return useLocalizer()(text, ...(args || []));
};

export { getLocaleString, getRTLList, localize };
