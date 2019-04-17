import createElement from '../createElement';
import { log } from '../logger';

export default function setupVersionFamily4(
  {
    botIconURL,
    directLineURL: domain,
    userId,
    webSocket
  }, {
    secret,
    token,
    username
  }
) {
  const directLine = window.WebChat.createDirectLine({ domain, secret, token, webSocket });

  // TODO: Should we support Bing Speech in Web Chat v4?

  const root = createElement(
    'div',
    {
      style: {
        height: '100%'
      }
    }
  );

  window.WebChat.renderWebChat({
    directLine,
    locale: navigator.language,
    styleOptions: {
      botAvatarImage: botIconURL
    },
    userId,
    username
  }, root);

  document.body.appendChild(root);
  root.children[0].style.height = '100%';

  const webChatVersionMeta = document.querySelector('head > meta[name="botframework-webchat:bundle:version"]');

  return { version: webChatVersionMeta.getAttribute('content') };
}
