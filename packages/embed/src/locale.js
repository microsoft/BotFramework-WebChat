// Supported Azure languages as of 2020-02-28
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
// zh-hans.zh-sg
// zh-hant.zh-hk
// zh-hant.zh-mo
// zh-hant.zh-tw

// Please note that Arabic and Hebrew are not currently supported by Azure

const AZURE_LOCALE_PATTERN = /^(([a-z]{2})(-[a-z]{2,})?)\.(([a-z]{2})(-[a-z]{2,})?)/;
const JAVASCRIPT_LOCALE_PATTERN = /^([a-z]{2})(-([A-Z][\w]+))*$/;

const AZURE_LOCALE_MAPPING = {
  cs: { '*': 'cs-CZ' },
  de: { '*': 'de-DE' },
  en: { '*': 'en-US' },
  es: { '*': 'es-ES' },
  fr: { '*': 'fr-FR' },
  hu: { '*': 'hu-HU' },
  it: { '*': 'it-IT' },
  ja: { '*': 'ja-JP' },
  ko: { '*': 'ko-KR' },
  nl: { '*': 'nl-NL' },
  pl: { '*': 'pl-PL' },
  'pt-br': { '*': 'pt-BR' },
  'pt-pt': { '*': 'pt-PT' },
  ru: { '*': 'ru-RU' },
  sv: { '*': 'sv-SE' },
  tr: { '*': 'tr-TR' },
  'zh-hans': { 'zh-sg': 'zh-Hans-SG', '*': 'zh-Hans' },
  'zh-hant': { 'zh-hk': 'zh-Hant-HK', 'zh-mo': 'zh-Hant-MO', '*': 'zh-Hant' }
};

function normalize(language) {
  let result;

  if (language !== 'en') {
    const azureLocaleMatch = AZURE_LOCALE_PATTERN.exec(language);
    const javaScriptLocaleMatch = JAVASCRIPT_LOCALE_PATTERN.exec(language);

    if (javaScriptLocaleMatch) {
      result = language;
    } else if (azureLocaleMatch) {
      const mapping = AZURE_LOCALE_MAPPING[azureLocaleMatch[1]];

      result = mapping[azureLocaleMatch[4]] || mapping['*'];
    }
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

    case 'yue':
    case 'zh-Hant-HK':
      return 'zh-hant.zh-hk';

    case 'zh-Hans':
      return 'zh-hans.zh-cn';

    case 'zh-Hans-SG':
      return `zh-hans.zh-sg`;

    case 'zh-Hant':
      return 'zh-hant.zh-tw';

    case 'zh-Hant-MO':
      return 'zh-hant.zh-mo';
  }

  if (
    Object.keys(AZURE_LOCALE_MAPPING).some(azureLocaleFirstPart =>
      language.toLowerCase().startsWith(azureLocaleFirstPart)
    )
  ) {
    const match = JAVASCRIPT_LOCALE_PATTERN.exec(language);

    if (match) {
      return `${match[1]}.${match[1]}-${match[3].toLowerCase()}`;
    }
  }
}

export { normalize, toAzureLocale };
