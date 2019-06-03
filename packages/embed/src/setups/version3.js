import loadAsset from './loadAsset';

export async function getBingSpeechToken(directLineToken, bingSpeechTokenURL) {
  const res = await fetch(`${bingSpeechTokenURL}?goodForInMinutes=10`, {
    headers: { Authorization: `Bearer ${directLineToken}` }
  });

  if (!res.ok) {
    throw new Error('Failed to get Bing Speech token');
  }

  const { access_Token: accessToken } = await res.json();

  return accessToken;
}

export default async function setupVersionFamily3(
  { assets },
  { botId, directLineURL: domain, speechTokenURL, userId, webSocket },
  { language, secret, token, username }
) {
  assets && (await Promise.all(assets.map(loadAsset)));

  let speechOptions;

  if (speechTokenURL && speechTokenURL.bingSpeech && token) {
    speechOptions = {
      speechRecognizer: new CognitiveServices.SpeechRecognizer({
        fetchCallback: () => getBingSpeechToken(token, speechTokenURL.bingSpeech),
        fetchOnExpiryCallback: () => getBingSpeechToken(token, speechTokenURL.bingSpeech)
      }),
      speechSynthesizer: new BotChat.Speech.BrowserSpeechSynthesizer()
    };
  }

  const root = document.createElement('div', {
    style: {
      height: '100%'
    }
  });

  window.BotChat.App(
    {
      directLine: { domain, secret, token, webSocket },
      bot: { id: botId },
      locale: language,
      resize: 'window',
      speechOptions,
      user: {
        id: userId,
        name: username || 'You'
      }
    },
    root
  );

  document.body.append(root);

  return { version: '3' };
}
