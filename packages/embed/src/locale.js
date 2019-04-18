const AZURE_LOCALE_PATTERN = /^([a-z]{2})(-([a-z]+))?\.([a-z]{2})-([a-z]{2})$/;
const JAVASCRIPT_LOCALE_PATTERN = /^([a-z]{2})(-([A-Za-z]{2}))?$/;

function normalize(language) {
  const azureLocaleMatch = AZURE_LOCALE_PATTERN.exec(language);
  const javaScriptLocaleMatch = JAVASCRIPT_LOCALE_PATTERN.exec(language);

  if (javaScriptLocaleMatch) {
    return language;
  } else if (azureLocaleMatch) {
    if (azureLocaleMatch[4]) {
      return `${ azureLocaleMatch[4] }-${ azureLocaleMatch[5].toUpperCase() }`;
    } else {
      return azureLocaleMatch[1];
    }
  } else {
    return 'en';
  }
}

function toAzureLocale(language) {
  const match = JAVASCRIPT_LOCALE_PATTERN.exec(language);

  if (match) {
    if (match[2]) {
      return `${ match[1] }.${ match[1] }-${ match[3].toLowerCase() }`;
    } else {
      return match[1];
    }
  }
}

export {
  normalize,
  toAzureLocale
}
