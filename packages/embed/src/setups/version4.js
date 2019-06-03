import createElement from './createElement';
import loadAsset from './loadAsset';

export default async function setupVersionFamily4(
  { assets },
  { botIconURL, directLineURL: domain, userId, webSocket },
  { language, secret, token, username }
) {
  assets && (await Promise.all(assets.map(loadAsset)));

  const directLine = window.WebChat.createDirectLine({ domain, secret, token, webSocket });

  // TODO: Should we support Bing Speech in Web Chat v4?

  const root = createElement('div', {
    style: {
      height: '100%'
    }
  });

  window.WebChat.renderWebChat(
    {
      directLine,
      locale: language,
      styleOptions: {
        botAvatarImage: botIconURL
      },
      userId,
      username
    },
    root
  );

  document.body.appendChild(root);
  root.children[0].style.height = '100%';

  const webChatVersionMeta = document.querySelector('head > meta[name="botframework-webchat:bundle:version"]');

  return { version: webChatVersionMeta && webChatVersionMeta.getAttribute('content') };
}
