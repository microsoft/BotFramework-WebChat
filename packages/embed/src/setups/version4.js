import createElement from './createElement';
import loadAsset from './loadAsset';

export default async function setupVersionFamily4(
  { assets },
  { botIconURL, directLineURL: domain, userId, webSocket },
  { language, secret, token, username }
) {
  assets && (await Promise.all(assets.map(loadAsset)));

  const directLine = window.WebChat.createDirectLine({
    conversationStartProperties: {
      locale: language
    },
    domain,
    secret,
    token,
    webSocket
  });

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
      userID: userId,
      username: username
    },
    root
  );

  document.body.appendChild(root);
  root.children[0].style.height = '100%';

  const webChatVersionMeta = document.querySelector('head > meta[name="botframework-webchat:bundle:version"]');

  return { version: webChatVersionMeta && webChatVersionMeta.getAttribute('content') };
}
