// Supported Azure language as of 2019-04-25
// The first part is language (localization), the second part is regional format (internationalization)

// en.en-us
// cs.cs-cz
// de.de-de
// es.es-es
// fr.fr-fr
// hu.hu-hu
// it.it-it
// ja.ja-jp
// ko.ko-kr
// nl.nl-nl
// pl.pl-pl
// pt-br.pt-br
// pt-pt.pt-pt
// ru.ru-ru
// sv.sv-se
// tr.tr-tr
// zh-hans.zh-cn
// zh-hant.zh-tw

const AZURE_LOCALE_PATTERN = /^(([a-z]{2})(-[a-z]{2,})?)\.([a-z]{2})/;
const JAVASCRIPT_LOCALE_PATTERN = /^([a-z]{2})-([A-Z]{2,})?$/;

const AZURE_LOCALE_MAPPING = {
  cs: 'cs-CZ',
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  hu: 'hu-HU',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  'pt-br': 'pt-BR',
  'pt-pt': 'pt-PT',
  ru: 'ru-RU',
  sv: 'sv-SE',
  tr: 'tr-TR',
  'zh-hans': 'zh-HANS',
  'zh-hant': 'zh-HANT'
};

function normalize(language) {
  const azureLocaleMatch = AZURE_LOCALE_PATTERN.exec(language);
  const javaScriptLocaleMatch = JAVASCRIPT_LOCALE_PATTERN.exec(language);
  let result;

  if (javaScriptLocaleMatch) {
    result = language;
  } else if (azureLocaleMatch) {
    result = AZURE_LOCALE_MAPPING[azureLocaleMatch[1]];
  }

  return result || 'en-US';
}

function toAzureLocale(language) {
  switch (language) {
    case 'fr':
      // This is for Firefox, which default French to "fr" instead of "fr-FR".
      return 'fr.fr-fr';

    case 'pt-BR':
      return 'pt-br.pt-br';

    case 'pt-PT':
      return 'pt-pt.pt-pt';

    case 'zh-CN':
    case 'zh-SG':
      return `zh-hans.${language.toLowerCase()}`;

    case 'zh-HANS':
      return 'zh-hans.zh-cn';

    case 'zh-HANT':
      return 'zh-hant.zh-tw';

    case 'zh-HK':
    case 'zh-MO':
    case 'zh-TW':
      return `zh-hant.${language.toLowerCase()}`;
  }

  const match = JAVASCRIPT_LOCALE_PATTERN.exec(language);

  if (match) {
    return `${match[1]}.${match[1]}-${match[2].toLowerCase()}`;
  }
}

export { normalize, toAzureLocale };
