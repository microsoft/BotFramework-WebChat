import { legacyEmbedURL } from '../urlBuilder';
import loadIFRAME from './loadIFRAME';

const JAVASCRIPT_LOCALE_PATTERN = /^([a-z]{2})(-([A-Za-z]{2}))?$/;

function toAzureLocale(language) {
  const match = JAVASCRIPT_LOCALE_PATTERN.exec(language);

  if (match) {
    if (match[2]) {
      return `${match[1]}.${match[1]}-${match[3].toLowerCase()}`;
    } else {
      return match[1];
    }
  }
}

export default async function setupLegacyVersionFamily(
  _,
  { botId, userId },
  { language, secret, token, username },
  features = []
) {
  // Version 1 also depends on your token.
  // If you are using a token on Aries, you get Aries (v1).
  // If you are using a token on Scorpio, you get Scorpio (v3).

  const params = new URLSearchParams();
  const azureLocale = language && toAzureLocale(language);

  features.length && params.set('features', features.join(','));
  azureLocale && params.set('l', azureLocale);
  secret && params.set('s', secret);
  token && params.set('t', token);
  userId && params.set('userid', userId);
  username && params.set('username', username);

  await loadIFRAME(legacyEmbedURL(botId, params));
}
