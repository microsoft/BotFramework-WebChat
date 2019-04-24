const AZURE_LOCALE_PATTERN = /^([a-z]{2})(-([a-z]+))?\.([a-z]{2})-([a-z]{2})$/;
const JAVASCRIPT_LOCALE_PATTERN = /^([a-z]{2})(-([A-Za-z]+))?$/;

function normalize(language) {
  const azureLocaleMatch = AZURE_LOCALE_PATTERN.exec(language);
  const javaScriptLocaleMatch = JAVASCRIPT_LOCALE_PATTERN.exec(language);

  if (javaScriptLocaleMatch) {
    return language;
  } else if (azureLocaleMatch) {
    return `${ azureLocaleMatch[4] }-${ azureLocaleMatch[5].toUpperCase() }`;
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
